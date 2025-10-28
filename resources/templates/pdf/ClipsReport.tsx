import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { useDaytalog } from 'daytalog';
import logo from './assets/obsidian.png';

const ClipsReport: React.FC = () => {
  const { projectName, log } = useDaytalog();

  const rows: Array<Record<string, any>> = log.clips.map((clip) => ({
    clip: clip.clip,
    tc_start: clip.tc_start,
    tc_end: clip.tc_end,
    duration: clip.durationTC(),
    fps: clip.fps !== clip.sensor_fps ? clip.fps : `${clip.sensor_fps} / (TC: ${clip.fps})`,
    size: clip.size(),
    camera: clip.camera_model,
    lens: clip.lens,
    codec: clip.codec,
    resolution: clip.resolution,
    ei: clip.ei,
    wb: clip.wb,
    tint: clip.tint,
    lut: clip.lut,
    proxy_format: `${clip.proxy.codec} (.${clip.proxy.format})`,
    sound: clip.sound?.join(', '),
    copies: clip.copies?.length,
  }));
  const headers = Object.keys(rows[0] || {});

  const charCounts = headers.map((h) => {
    const all = rows.map((r) => String(r[h]).length).concat(h.length);
    return Math.max(...all);
  });
  const totalChars = charCounts.reduce((sum, x) => sum + x, 0);

  // 2) Convert to % widths:
  const colPercents = charCounts.map((c) => (c / totalChars) * 100);

  return (
    <Document title='Clips'>
      <Page size='A4' orientation='landscape' style={styles.page}>
        <View>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{`Clips Report - Day ${log.day()} - ${log.date()}`}</Text>
              <Text>Project: {projectName}</Text>
            </View>
            <Image style={styles.logo} src={logo} />
          </View>
          <View style={styles.cardGroup}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Duration</Text>
              <Text style={styles.cardText}>{log.ocf.duration()}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Camera Files</Text>
              <Text style={styles.cardText}>{`${log.ocf.files()} clips, ${log.ocf.size()}`}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Proxy Files</Text>
              <Text
                style={styles.cardText}
              >{`${log.proxy.files()} clips, ${log.proxy.size()}`}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sound Files</Text>
              <Text
                style={styles.cardText}
              >{`${log.sound.files()} clips, ${log.sound.size()}`}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Camera Reels</Text>
              <Text style={styles.cardText}>{log.ocf.reels({ mergeRanges: true })}</Text>
            </View>
          </View>
          {!!log.clips.length ? (
            <View style={styles.table}>
              {/* Header Row */}
              <View style={styles.row} fixed>
                {headers.map((header, i) => (
                  <Text
                    key={i}
                    style={[
                      styles.headerCell,
                      {
                        width: `${colPercents[i]}%`,
                        borderTopLeftRadius: i === 0 ? 2 : 0,
                        borderTopRightRadius: i === headers.length - 1 ? 2 : 0,
                      },
                    ]}
                  >
                    {(() => {
                      const label = header
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase());
                      return label.length <= 3 ? label.toUpperCase() : label;
                    })()}
                  </Text>
                ))}
              </View>

              {/* Data Rows */}
              {rows.map((row, rowIndex) => (
                <View
                  key={rowIndex}
                  style={[styles.row, rowIndex % 2 === 1 ? styles.zebra : {}]}
                  wrap={false}
                >
                  {headers.map((header, colIndex) => (
                    <Text
                      key={colIndex}
                      style={[styles.cell, { width: `${colPercents[colIndex]}%` }]}
                    >
                      {row[header]}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          ) : (
            <View>
              <Text>{`No clips :(`}</Text>
            </View>
          )}
        </View>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => totalPages > 1 && `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
};

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', padding: 40, fontSize: 12, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  projectInfo: { fontSize: 12 },
  table: { display: 'table', width: '100%', borderCollapse: 'collapse', marginTop: 10 },
  row: { flexDirection: 'row' },
  headerCell: {
    padding: 6,
    backgroundColor: '#09090b',
    color: '#fff',
    fontSize: 5,
    fontWeight: '500',
    textAlign: 'left',
  },
  cell: {
    padding: 6,
    fontSize: 4,
    color: '#333',
    textAlign: 'left',
    borderBottomWidth: 0.2,
    borderBottomColor: '#ddd',
  },
  zebra: { backgroundColor: '#f8f8f8' },
  pageNumber: { fontSize: 4, position: 'absolute', bottom: 20, right: 20 },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  header: {
    flex: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  card: {
    width: '25%',
    gap: 2,
    padding: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dedede',
  },
  cardTitle: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: 14,
    fontWeight: '200',
  },
});

export default ClipsReport;
