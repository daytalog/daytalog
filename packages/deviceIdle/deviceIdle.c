#include <CoreFoundation/CoreFoundation.h>
#include <IOKit/IOKitLib.h>
#include <IOKit/storage/IOBlockStorageDriver.h>
#include <IOKit/storage/IOMedia.h>
#include <IOKit/IOBSD.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/time.h>
#include <dirent.h>
#include <errno.h>

#define MAXDRIVES 16
#define MAXNAME 32
#define IDLE_THRESHOLD 3

struct drivestat {
    io_registry_entry_t driver;
    char name[MAXNAME];
    uint64_t blocksize;
    uint64_t total_bytes;
    int idle_count;
};

static struct drivestat drives[MAXDRIVES];
static int num_drives = 0;
static mach_port_t masterPort;
static IONotificationPortRef notifyPort;

/* ---------------- Helper prototypes ---------------- */
static void record_device(io_registry_entry_t drive);
static void add_drives(void *ref, io_iterator_t iter);
static void remove_drives(void *ref, io_iterator_t iter);
static void update_stats(double interval);
static double elapsed(struct timeval now, struct timeval prev);

/* ---------------- main ---------------- */
int main(int argc, char **argv) {
    int wait = 1;
    if (argc > 1) wait = atoi(argv[1]);
    if (wait < 1) wait = 1;

    IOMainPort(bootstrap_port, &masterPort);
    notifyPort = IONotificationPortCreate(masterPort);
    CFRunLoopSourceRef rls = IONotificationPortGetRunLoopSource(notifyPort);
    CFRunLoopAddSource(CFRunLoopGetCurrent(), rls, kCFRunLoopDefaultMode);

    // Match all whole IOMedia devices
    CFMutableDictionaryRef match = IOServiceMatching("IOMedia");
    CFDictionaryAddValue(match, CFSTR(kIOMediaWholeKey), kCFBooleanTrue);
    CFRetain(match);

    io_iterator_t iter;
    if (IOServiceAddMatchingNotification(
            notifyPort, kIOFirstMatchNotification, match, add_drives, NULL, &iter)
        == KERN_SUCCESS)
        add_drives(NULL, iter);

    if (IOServiceAddMatchingNotification(
            notifyPort, kIOTerminatedNotification, match, remove_drives, NULL, &iter)
        == KERN_SUCCESS)
        remove_drives(NULL, iter);

    struct timeval last, now;
    gettimeofday(&last, NULL);

    for (;;) {
        CFRunLoopRunInMode(kCFRunLoopDefaultMode, wait, false);
        gettimeofday(&now, NULL);
        update_stats(elapsed(now, last));
        last = now;
    }
}

/* ---------------- Device added ---------------- */
static void add_drives(void *ref, io_iterator_t iter) {
    io_registry_entry_t drive;
    while ((drive = IOIteratorNext(iter))) {
        if (num_drives >= MAXDRIVES) {
            IOObjectRelease(drive);
            continue;
        }
        record_device(drive);
        IOObjectRelease(drive);
    }
}

/* ---------------- Device removed ---------------- */
static void remove_drives(void *ref, io_iterator_t iter) {
    io_registry_entry_t drive;
    while ((drive = IOIteratorNext(iter))) {
        CFDictionaryRef props;
        CFStringRef name;
        char bsdname[MAXNAME] = {0};

        if (IORegistryEntryCreateCFProperties(
                drive, (CFMutableDictionaryRef *)&props,
                kCFAllocatorDefault, kNilOptions) == KERN_SUCCESS) {
            name = CFDictionaryGetValue(props, CFSTR(kIOBSDNameKey));
            if (name)
                CFStringGetCString(name, bsdname, sizeof(bsdname),
                                   kCFStringEncodingUTF8);
            CFRelease(props);
        }

        if (bsdname[0]) {
            for (int i = 0; i < num_drives; i++) {
                if (strcmp(bsdname, drives[i].name) == 0) {
                    IOObjectRelease(drives[i].driver);
                    memmove(&drives[i], &drives[i + 1],
                            sizeof(struct drivestat) * (num_drives - i - 1));
                    num_drives--;
                    break;
                }
            }
        }

        IOObjectRelease(drive);
    }
}

/* ---------------- Record device ---------------- */
static void record_device(io_registry_entry_t drive) {
    io_registry_entry_t parent;
    if (IORegistryEntryGetParentEntry(drive, kIOServicePlane, &parent)
        != KERN_SUCCESS)
        return;
    if (!IOObjectConformsTo(parent, "IOBlockStorageDriver")) {
        IOObjectRelease(parent);
        return;
    }

    CFDictionaryRef props;
    if (IORegistryEntryCreateCFProperties(
            drive, (CFMutableDictionaryRef *)&props,
            kCFAllocatorDefault, kNilOptions) != KERN_SUCCESS) {
        IOObjectRelease(parent);
        return;
    }

    CFStringRef name = CFDictionaryGetValue(props, CFSTR(kIOBSDNameKey));
    CFNumberRef num = CFDictionaryGetValue(props, CFSTR(kIOMediaPreferredBlockSizeKey));

    if (name && CFStringGetCString(name, drives[num_drives].name,
                                   sizeof(drives[num_drives].name),
                                   kCFStringEncodingUTF8)) {
        drives[num_drives].driver = parent;
        drives[num_drives].blocksize = 512;
        if (num)
            CFNumberGetValue(num, kCFNumberSInt64Type,
                             &drives[num_drives].blocksize);
        drives[num_drives].total_bytes = 0;
        drives[num_drives].idle_count = 0;
        num_drives++;
    } else {
        IOObjectRelease(parent);
    }

    CFRelease(props);
}

/* ---------------- Compute interval ---------------- */
static double elapsed(struct timeval now, struct timeval prev) {
    return (now.tv_sec - prev.tv_sec) + (now.tv_usec - prev.tv_usec) / 1e6;
}

/* ---------------- Print stats as JSON ---------------- */
static void update_stats(double interval) {
    printf("[");
    for (int i = 0; i < num_drives; i++) {
        CFDictionaryRef props, stats;
        CFNumberRef num;
        uint64_t bytes_read = 0, bytes_written = 0;

        if (IORegistryEntryCreateCFProperties(
                drives[i].driver, (CFMutableDictionaryRef *)&props,
                kCFAllocatorDefault, kNilOptions) != KERN_SUCCESS)
            continue;

        stats = CFDictionaryGetValue(props, CFSTR(kIOBlockStorageDriverStatisticsKey));
        if (stats) {
            num = CFDictionaryGetValue(stats, CFSTR(kIOBlockStorageDriverStatisticsBytesReadKey));
            if (num)
                CFNumberGetValue(num, kCFNumberSInt64Type, &bytes_read);
            num = CFDictionaryGetValue(stats, CFSTR(kIOBlockStorageDriverStatisticsBytesWrittenKey));
            if (num)
                CFNumberGetValue(num, kCFNumberSInt64Type, &bytes_written);
        }
        CFRelease(props);

        uint64_t total = bytes_read + bytes_written;
        uint64_t diff =
            (drives[i].total_bytes) ? (total - drives[i].total_bytes) : 0;
        drives[i].total_bytes = total;

        const uint64_t threshold_bytes = 1024 * 1024 * 10; // 10 MB
        if (diff < threshold_bytes)
             drives[i].idle_count++;
        else
             drives[i].idle_count = 0;
        int idle = (drives[i].idle_count >= IDLE_THRESHOLD);

        printf("{\"device\":\"%s\",\"idle\":%s}%s",
            drives[i].name, (drives[i].idle_count >= IDLE_THRESHOLD) ? "true" : "false",
            (i == num_drives - 1) ? "" : ",");
    }
    printf("]\n");
    fflush(stdout);
}