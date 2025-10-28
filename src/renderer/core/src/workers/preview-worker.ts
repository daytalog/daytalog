import React from 'react'
import { transform } from 'sucrase'
import { pdf, DocumentProps } from '@react-pdf/renderer'
import { render } from './utils/render'
import { PreviewWorkerRequest } from './utils/types'
import { inlineAssetImports } from '@shared/core/utils/inlineAssetsImports'
import { removeImports } from '@shared/core/utils/removeImports'
import { insertPoweredBy } from '@shared/core/utils/addPoweredBy'
import { createDaytalog, InternalDaytalogProvider, useDaytalog } from 'daytalog'

// Polyfill Buffer for @react-pdf/renderer in browser/worker environments
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof self !== 'undefined' && !(self as any).Buffer) {
  // Minimal Buffer polyfill for base64 decoding/encoding
  // Only implements what @react-pdf/renderer needs
  // @ts-ignore
  ;(self as any).Buffer = {
    from: function (str: string, encoding: string) {
      if (encoding === 'base64') {
        // atob returns a binary string, so we need to convert to Uint8Array
        const binary = atob(str)
        const len = binary.length
        const bytes = new Uint8Array(len)
        for (let i = 0; i < len; i++) {
          bytes[i] = binary.charCodeAt(i)
        }
        return bytes
      }
      throw new Error('Buffer.from: Unsupported encoding: ' + encoding)
    },
    isBuffer: function (obj: any) {
      // @react-pdf/renderer expects Buffer.isBuffer to check for buffer-like objects
      return obj instanceof Uint8Array
    }
  }
}

self.onmessage = async (event: MessageEvent<PreviewWorkerRequest>) => {
  const { code, type, daytalogProps, id } = event.data
  let components: Record<string, unknown> = {}
  let originalConsole: Partial<typeof console> = {}

  if (!daytalogProps) {
    return // Just wait for the next message
  }

  try {
    const dayta = await createDaytalog(daytalogProps)

    if (type === 'email') {
      const {
        Html,
        Head,
        Body,
        Button,
        Container,
        CodeBlock,
        CodeInline,
        Column,
        Row,
        Font,
        Heading,
        Hr,
        Img,
        Link,
        Markdown,
        Section,
        Preview,
        Text
      } = await import('@react-email/components')

      components = {
        Html,
        Head,
        Body,
        Button,
        Container,
        CodeBlock,
        CodeInline,
        Column,
        Row,
        Font,
        Heading,
        Hr,
        Img,
        Link,
        Markdown,
        Section,
        Preview,
        Text
      }
    } else if (type === 'pdf') {
      const { Document, Page, View, Text, Link, Image, Font, StyleSheet } = await import(
        '@react-pdf/renderer'
      )

      components = {
        Document,
        Page,
        View,
        Text,
        Link,
        Image,
        Font,
        StyleSheet
      }
    }

    const codeWithAssets = await inlineAssetImports(type, id, code)
    const codeWithoutImports = await removeImports(codeWithAssets)
    const formatted = insertPoweredBy(codeWithoutImports, type)

    const transpiledCode = transform(formatted, {
      transforms: ['typescript', 'jsx', 'imports'],
      preserveDynamicImport: true
    }).code

    const wrappedCode = `
      const module = { exports: {} };
      const exports = module.exports;
      ${transpiledCode}
      return module.exports.default;
    `

    // Intercept console methods
    originalConsole = { ...console }
    const logBuffer: { level: string; args: any[] }[] = []
    function safeClone(arg: any) {
      if (arg === null || typeof arg !== 'object') {
        if (typeof arg === 'function') {
          return { __isFunction: true, name: '' }
        }
        return arg
      }
      if (Array.isArray(arg)) {
        return arg.map((item) => safeClone(item))
      }
      const result: Record<string, any> = {}
      for (const key in arg) {
        if (Object.prototype.hasOwnProperty.call(arg, key)) {
          if (typeof arg[key] === 'function') {
            result[key] = { __isFunction: true, name: key }
          } else {
            result[key] = safeClone(arg[key])
          }
        }
      }
      return result
    }
    ;['log', 'table', 'dir', 'error'].forEach((level) => {
      console[level] = (...args: any[]) => {
        const safeArgs = args.map((arg) => safeClone(arg))
        logBuffer.push({ level, args: safeArgs })
        self.postMessage({
          msgtype: 'preview-console',
          id,
          level,
          args: safeArgs
        })
        // Optionally call the original console method
        originalConsole[level](...args)
      }
    })

    const Component = new Function('React', ...Object.keys(components), 'useDaytalog', wrappedCode)(
      React,
      ...Object.values(components),
      useDaytalog
    )

    if (type === 'email') {
      try {
        const renderEmail = await render(
          React.createElement(InternalDaytalogProvider, {
            value: dayta,
            children: React.createElement(Component)
          })
        )
        if (renderEmail.success) {
          self.postMessage({
            msgtype: 'preview-update',
            success: true,
            id,
            type,
            code: renderEmail.html
          })
        } else {
          self.postMessage({
            msgtype: 'preview-update',
            success: false,
            id,
            error: renderEmail.error
          })
        }
      } catch (err) {
        console.error('Error rendering email preview', err)
        self.postMessage({
          msgtype: 'preview-update',
          success: false,
          id,
          error: (err as Error).message
        })
      }
    } else if (type === 'pdf') {
      try {
        const providerElement = React.createElement(InternalDaytalogProvider, {
          value: dayta,
          children: React.createElement(Component)
        })
        // Cast to satisfy pdf() DocumentProps requirement
        const doc = pdf(providerElement as unknown as React.ReactElement<DocumentProps>)
        const blob = await doc.toBlob()
        const url = URL.createObjectURL(blob)

        self.postMessage({
          msgtype: 'preview-update',
          success: true,
          id,
          type,
          code: url
        })
      } catch (err) {
        console.error('Error rendering PDF preview', err)
        self.postMessage({
          msgtype: 'preview-update',
          success: false,
          id,
          error: (err as Error).message
        })
      }
    }
  } catch (error) {
    console.error('Error in preview-worker', error)
    self.postMessage({
      msgtype: 'preview-update',
      success: false,
      id,
      error: (error as Error).message
    })
  } finally {
    // Restore original console methods
    if (Object.keys(originalConsole).length > 0) Object.assign(console, originalConsole)
  }
}
