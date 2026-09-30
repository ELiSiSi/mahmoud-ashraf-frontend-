import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Clock,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  X,
  Heart,
  Check,
} from 'lucide-react';
import axios from 'axios';
import { sheikhConfig } from '../data/sheikhConfig';

interface PrayerData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface NextPrayerData {
  key: keyof PrayerData;
  name: string;
  time: string;
  diffMs: number;
  diff: string;
}

type ReminderType =
  | 'prayer'
  | 'upcoming';

// ============================================================================
// Constants
// ============================================================================

// قبل الصلاة القادمة بنصف ساعة
const UPCOMING_PRAYER_WINDOW = 30 * 60 * 1000;

// تذكير الصلاة القادمة كل 10 دقائق
const UPCOMING_PRAYER_INTERVAL = 10 * 60 * 1000;

// مدة ظهور الإشعار الافتراضية
const DEFAULT_TOAST_DURATION = 6000;

// ============================================================================
// Prayer Names
// ============================================================================

const PRAYER_NAMES: Record<
  keyof PrayerData,
  string
> = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

// ============================================================================
// Prayer Icons
// ============================================================================

const PRAYER_ICONS: Record<
  keyof PrayerData,
  typeof Moon
> = {
  Fajr: Moon,
  Sunrise: Sunrise,
  Dhuhr: Sun,
  Asr: Sun,
  Maghrib: Sunset,
  Isha: Moon,
};

// ============================================================================
// Main Prayer Keys
// الشروق مش صلاة لذلك لا يدخل في حساب الصلاة السابقة / القادمة
// ============================================================================

const MAIN_PRAYER_KEYS: (
  keyof PrayerData
)[] = [
  'Fajr',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Isha',
];

// ============================================================================
// All Prayer Keys
// ============================================================================

const ALL_PRAYER_KEYS: (
  keyof PrayerData
)[] = [
  'Fajr',
  'Sunrise',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Isha',
];

// ============================================================================
// Helpers
// ============================================================================

const parsePrayerTime = (
  time: string,
  date = new Date()
) => {
  const match =
    time.match(/(\d{1,2}):(\d{2})/);

  if (!match) {
    const fallback = new Date(date);

    fallback.setHours(
      0,
      0,
      0,
      0
    );

    return fallback;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  const result = new Date(date);

  result.setHours(
    hours,
    minutes,
    0,
    0
  );

  return result;
};

const formatTime = (time: string) => {
  const match =
    time.match(/(\d{1,2}):(\d{2})/);

  if (!match) return time;

  return `${match[1].padStart(
    2,
    '0'
  )}:${match[2]}`;
};

const formatCountdown = (
  diffMs: number
) => {
  const totalSeconds = Math.max(
    0,
    Math.floor(diffMs / 1000)
  );

  const hours = Math.floor(
    totalSeconds / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds =
    totalSeconds % 60;

  return `${hours
    .toString()
    .padStart(
      2,
      '0'
    )}:${minutes
    .toString()
    .padStart(
      2,
      '0'
    )}:${seconds
    .toString()
    .padStart(
      2,
      '0'
    )}`;
};

const getPrayerDate = (
  key: keyof PrayerData,
  prayers: PrayerData,
  date = new Date()
) => {
  return parsePrayerTime(
    prayers[key],
    date
  );
};

// ============================================================================
// Local Date Key
// ============================================================================

const getDateKey = (
  date: Date = new Date()
) => {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

// ============================================================================
// Local Storage Key
// ============================================================================

const getPrayerCompletedKey = (
  prayer: keyof PrayerData,
  date: Date
) => {
  return `prayer_completed_${getDateKey(
    date
  )}_${prayer}`;
};

// ============================================================================
// Check if user marked prayer as completed
// ============================================================================

const isPrayerCompleted = (
  prayer: keyof PrayerData,
  date: Date
) => {
  try {
    return (
      localStorage.getItem(
        getPrayerCompletedKey(
          prayer,
          date
        )
      ) === 'true'
    );
  } catch {
    return false;
  }
};

// ============================================================================
// Mark prayer as completed
// ============================================================================

const markPrayerCompleted = (
  prayer: keyof PrayerData,
  date: Date
) => {
  try {
    localStorage.setItem(
      getPrayerCompletedKey(
        prayer,
        date
      ),
      'true'
    );
  } catch {
    // Ignore localStorage errors
  }
};

// ============================================================================
// Prayer Times Component
// ============================================================================

export const PrayerTimes = () => {
  const [prayers, setPrayers] =
    useState<PrayerData | null>(
      null
    );

  const [now, setNow] =
    useState(new Date());

  const [loading, setLoading] =
    useState(true);

  // ==========================================================================
  // Notification State
  // ==========================================================================

  const [showReminder, setShowReminder] =
    useState(false);

  const [reminderPrayer, setReminderPrayer] =
    useState<keyof PrayerData | null>(
      null
    );

  const [reminderType, setReminderType] =
    useState<ReminderType | null>(
      null
    );

  // ==========================================================================
  // Refs
  // ==========================================================================

  const reminderTimerRef =
    useRef<number | null>(null);

  const lastReminderKeyRef =
    useRef<string>('');

  // ==========================================================================
  // Fetch Prayer Times
  // ==========================================================================

  useEffect(() => {
    const fetchPrayers = async () => {
      try {
        const res =
          await axios.get(
            'https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt&method=5'
          );

        const timings =
          res.data.data.timings;

        setPrayers({
          Fajr: timings.Fajr,
          Sunrise: timings.Sunrise,
          Dhuhr: timings.Dhuhr,
          Asr: timings.Asr,
          Maghrib:
            timings.Maghrib,
          Isha: timings.Isha,
        });

        setLoading(false);
      } catch (error) {
        console.error(
          'Error fetching prayer times:',
          error
        );

        setLoading(false);
      }
    };

    fetchPrayers();
  }, []);

  // ==========================================================================
  // Live Clock
  // ==========================================================================

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        setNow(new Date());
      }, 1000);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, []);

  // ==========================================================================
  // Calculate Prayer State
  // ==========================================================================

  const prayerState = useMemo(() => {
    if (!prayers) return null;

    const today =
      new Date(now);

    const prayerDates =
      MAIN_PRAYER_KEYS.map(
        (key) => ({
          key,
          date: getPrayerDate(
            key,
            prayers,
            today
          ),
        })
      );

    // ------------------------------------------------------------------------
    // Next Prayer
    // ------------------------------------------------------------------------

    let nextPrayer:
      | {
          key: keyof PrayerData;
          date: Date;
        }
      | null = null;

    for (
      const prayer of prayerDates
    ) {
      if (
        prayer.date > now
      ) {
        nextPrayer = prayer;
        break;
      }
    }

    // ------------------------------------------------------------------------
    // Tomorrow Fajr
    // ------------------------------------------------------------------------

    if (!nextPrayer) {
      const tomorrow =
        new Date(now);

      tomorrow.setDate(
        tomorrow.getDate() + 1
      );

      nextPrayer = {
        key: 'Fajr',
        date: getPrayerDate(
          'Fajr',
          prayers,
          tomorrow
        ),
      };
    }

    // ------------------------------------------------------------------------
    // Previous Prayer
    // ------------------------------------------------------------------------

    let previousPrayer:
      | {
          key: keyof PrayerData;
          date: Date;
        }
      | null = null;

    for (
      const prayer of prayerDates
    ) {
      if (
        prayer.date <= now
      ) {
        previousPrayer =
          prayer;
      }
    }

    const diffMs =
      nextPrayer.date.getTime() -
      now.getTime();

    const nextPrayerData: NextPrayerData =
      {
        key: nextPrayer.key,
        name:
          PRAYER_NAMES[
            nextPrayer.key
          ],
        time:
          prayers[
            nextPrayer.key
          ],
        diffMs,
        diff:
          formatCountdown(
            diffMs
          ),
      };

    return {
      nextPrayer:
        nextPrayerData,
      previousPrayer,
    };
  }, [now, prayers]);

  // ==========================================================================
  // Smart Notification Scheduler
  // ==========================================================================

  useEffect(() => {
    if (
      !prayers ||
      !prayerState
    ) {
      return;
    }

    const {
      nextPrayer,
      previousPrayer,
    } = prayerState;

    // ------------------------------------------------------------------------
    // 1. Upcoming Prayer
    // ------------------------------------------------------------------------
    //
    // قبل الصلاة بـ 30 دقيقة:
    //
    // 30 -> notification
    // 20 -> notification
    // 10 -> notification
    //
    // ويكون هذا أعلى أولوية من تذكير الصلاة السابقة.
    // ------------------------------------------------------------------------

    const remainingUntilNext =
      nextPrayer.diffMs;

    if (
      remainingUntilNext > 0 &&
      remainingUntilNext <=
        UPCOMING_PRAYER_WINDOW
    ) {
      const elapsedFromWindowStart =
        UPCOMING_PRAYER_WINDOW -
        remainingUntilNext;

      const reminderSlot = Math.floor(
        elapsedFromWindowStart /
          UPCOMING_PRAYER_INTERVAL
      );

      const upcomingReminderKey =
        `upcoming_${getDateKey(
          now
        )}_${nextPrayer.key}_${reminderSlot}`;

      if (
        lastReminderKeyRef.current !==
        upcomingReminderKey
      ) {
        lastReminderKeyRef.current =
          upcomingReminderKey;

        showNotification(
          nextPrayer.key,
          'upcoming'
        );
      }

      return;
    }

    // ------------------------------------------------------------------------
    // 2. Previous Prayer Reminder
    // ------------------------------------------------------------------------
    //
    // أول ما يدخل وقت الصلاة:
    // يظهر فورًا
    //
    // لو لم يضغط "آه صليت":
    // كل 5 دقائق
    //
    // لو ضغط "آه صليت":
    // لا يظهر مرة أخرى لنفس الصلاة
    // ------------------------------------------------------------------------

    if (
      previousPrayer
    ) {
      const prayerCompleted =
        isPrayerCompleted(
          previousPrayer.key,
          now
        );

      // المستخدم قال إنه صلى
      if (
        prayerCompleted
      ) {
        return;
      }

      const elapsedSincePrayer =
        now.getTime() -
        previousPrayer.date.getTime();

      // تذكير الصلاة نفسها
      const prayerReminderInterval =
        sheikhConfig.settings
          ?.prayerReminderInterval ||
        5 * 60 * 1000;

      if (
        elapsedSincePrayer >=
        0
      ) {
        const reminderSlot =
          Math.floor(
            elapsedSincePrayer /
              prayerReminderInterval
          );

        const prayerReminderKey =
          `prayer_${getDateKey(
            now
          )}_${previousPrayer.key}_${reminderSlot}`;

        if (
          lastReminderKeyRef.current !==
          prayerReminderKey
        ) {
          lastReminderKeyRef.current =
            prayerReminderKey;

          showNotification(
            previousPrayer.key,
            'prayer'
          );
        }
      }
    }
  }, [
    now,
    prayers,
    prayerState,
  ]);

  // ==========================================================================
  // Show Notification
  // ==========================================================================

  const showNotification = (
    prayer: keyof PrayerData,
    type: ReminderType
  ) => {
    const duration =
      sheikhConfig.settings
        ?.prayerReminderDuration ||
      DEFAULT_TOAST_DURATION;

    setReminderPrayer(
      prayer
    );

    setReminderType(
      type
    );

    setShowReminder(
      true
    );

    // Clear previous auto-hide
    if (
      reminderTimerRef.current
    ) {
      window.clearTimeout(
        reminderTimerRef.current
      );
    }

    reminderTimerRef.current =
      window.setTimeout(() => {
        setShowReminder(
          false
        );
      }, duration);
  };

  // ==========================================================================
  // Mark "I Prayed"
  // ==========================================================================

  const handlePrayerCompleted =
    () => {
      if (!reminderPrayer) {
        return;
      }

      markPrayerCompleted(
        reminderPrayer,
        now
      );

      // مهم جدًا:
      // نمنع نفس الإشعار من الظهور مرة ثانية
      lastReminderKeyRef.current =
        `completed_${getDateKey(
          now
        )}_${reminderPrayer}`;

      setShowReminder(
        false
      );

      if (
        reminderTimerRef.current
      ) {
        window.clearTimeout(
          reminderTimerRef.current
        );
      }
    };

  // ==========================================================================
  // Close Notification
  // ==========================================================================

  const closeReminder = () => {
    setShowReminder(
      false
    );

    if (
      reminderTimerRef.current
    ) {
      window.clearTimeout(
        reminderTimerRef.current
      );
    }
  };

  // ==========================================================================
  // Loading
  // ==========================================================================

  if (
    loading ||
    !prayers ||
    !prayerState
  ) {
    return null;
  }

  const {
    nextPrayer,
  } = prayerState;

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <>
      {/* ================================================================== */}
      {/* Smart Prayer Notification */}
      {/* ================================================================== */}

      <AnimatePresence>
        {showReminder &&
          reminderPrayer &&
          reminderType && (
            <motion.div
              initial={{
                opacity: 0,
                x: 50,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                x: 50,
                scale: 0.95,
              }}
              transition={{
                duration: 0.35,
                ease: 'easeOut',
              }}
              className="
                fixed
                top-24
                right-4
                md:right-8
                z-[9999]
                w-[calc(100%-32px)]
                max-w-sm
                pointer-events-none
              "
            >
              <div
                dir="rtl"
                className="
                  pointer-events-auto
                  relative
                  overflow-hidden
                  rounded-l-xl
                  bg-white
                  dark:bg-card
                  shadow-2xl
                  p-4
                  md:p-5
                "
                style={{ borderRight: '4px solid var(--gold)' }}
              >
                {/* ======================================================== */}
                {/* Background Glow */}
                {/* ======================================================== */}

                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-l
                    from-gold/5
                    to-transparent
                    pointer-events-none
                  "
                />

                <div className="relative">

                  {/* ====================================================== */}
                  {/* Header */}
                  {/* ====================================================== */}

                  <div className="flex items-start gap-3">

                    {/* Icon */}
                    <div
                      className={`
                        w-11 h-11
                        md:w-12 md:h-12
                        shrink-0
                        rounded-full
                        flex items-center justify-center
                        shadow-md

                        ${
                          reminderType ===
                          'upcoming'
                            ? 'bg-primary text-gold'
                            : 'bg-gold text-primary'
                        }
                      `}
                    >
                      {reminderType ===
                      'upcoming' ? (
                        <Clock className="w-5 h-5 md:w-6 md:h-6" />
                      ) : (
                        <Heart
                          className="w-5 h-5 md:w-6 md:h-6"
                          fill="currentColor"
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">

                      {/* Title */}
                      <div className="flex items-center gap-2 mb-1">

                        {reminderType ===
                        'upcoming' ? (
                          <Bell className="w-4 h-4 text-gold" />
                        ) : (
                          <Heart
                            className="w-4 h-4 text-gold"
                            fill="currentColor"
                          />
                        )}

                        <span className="text-xs md:text-sm font-bold text-gold">
                          {reminderType ===
                          'upcoming'
                            ? `استعد لصلاة ${PRAYER_NAMES[reminderPrayer]}`
                            : `تذكير بصلاة ${PRAYER_NAMES[reminderPrayer]}`}
                        </span>
                      </div>

                      {/* Message */}
                      <p className="text-sm md:text-base font-bold text-primary dark:text-primary-light leading-relaxed">
                        {reminderType ===
                        'upcoming'
                          ? `صلاة ${PRAYER_NAMES[reminderPrayer]} الساعة ${formatTime(
                              prayers[
                                reminderPrayer
                              ]
                            )} — باقي ${formatCountdown(
                              nextPrayer.diffMs
                            )}`
                          : `أوعي تكون نسيت ${PRAYER_NAMES[reminderPrayer]} يا قمر، لو لسه ما صليتش قوم صلّيها ❤️`}
                      </p>
                    </div>

                    {/* Close */}
                    <button
                      type="button"
                      onClick={
                        closeReminder
                      }
                      aria-label="إغلاق التنبيه"
                      className="
                        shrink-0
                        w-8 h-8
                        rounded-full
                        flex items-center justify-center
                        text-muted
                        hover:text-primary
                        hover:bg-primary/5
                        transition-colors
                      "
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* ====================================================== */}
                  {/* "I Prayed" Button */}
                  {/* ====================================================== */}

                  {reminderType ===
                    'prayer' && (
                    <div className="mt-4 pt-3 border-t border-border/70">

                      <button
                        type="button"
                        onClick={
                          handlePrayerCompleted
                        }
                        className="
                          w-full
                          flex items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-primary
                          hover:bg-primary-light
                          text-white
                          px-4
                          py-2.5
                          font-bold
                          text-sm
                          transition-all
                          shadow-md
                          hover:shadow-lg
                        "
                      >
                        <Check className="w-4 h-4 text-gold" />

                        آه صليت ✅
                      </button>
                    </div>
                  )}
                </div>

                {/* ======================================================== */}
                {/* Progress */}
                {/* ======================================================== */}

                <motion.div
                  initial={{
                    width: '100%',
                  }}
                  animate={{
                    width: '0%',
                  }}
                  transition={{
                    duration:
                      (sheikhConfig.settings
                        ?.prayerReminderDuration ||
                        DEFAULT_TOAST_DURATION) /
                      1000,
                    ease: 'linear',
                  }}
                  className="
                    absolute
                    bottom-0
                    right-0
                    h-1
                    bg-gold
                  "
                />
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* ================================================================== */}
      {/* Prayer Times Bar */}
      {/* ================================================================== */}

      <section className="bg-card border-y border-border shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-6 relative z-10">

          <div className="flex flex-col lg:flex-row items-center justify-between gap-5">

            {/* ============================================================ */}
            {/* Next Prayer */}
            {/* ============================================================ */}

            <motion.div
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              className="
                flex items-center gap-4
                bg-gradient-to-r
                from-primary/10
                to-transparent
                rounded-2xl
                p-3 md:p-4
                border
                border-gold/30
                shadow-sm
                w-full
                lg:w-auto
                shrink-0
              "
            >
              <div className="w-12 h-12 bg-gold text-primary rounded-full flex items-center justify-center shrink-0">
                <Bell className="w-6 h-6 animate-pulse" />
              </div>

              <div className="flex-1">

                <div className="text-sm font-bold text-muted mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  الصلاة القادمة
                </div>

                <div className="text-lg md:text-xl font-bold text-primary dark:text-gold flex flex-wrap items-center gap-3">

                  <span>
                    {nextPrayer.name}
                  </span>

                  <span
                    className="text-xl md:text-2xl font-mono tracking-wider"
                    style={{
                      direction:
                        'ltr',
                    }}
                  >
                    {nextPrayer.diff}
                  </span>
                </div>

                <div className="text-xs text-muted mt-1">
                  الساعة{' '}
                  {formatTime(
                    nextPrayer.time
                  )}
                </div>
              </div>
            </motion.div>

            {/* ============================================================ */}
            {/* All Prayer Times */}
            {/* ============================================================ */}

            <div className="flex-1 w-full overflow-x-auto pb-2 -mb-2 scrollbar-hide">
              <div className="flex items-center justify-start lg:justify-end gap-2 md:gap-3 min-w-max">

                {ALL_PRAYER_KEYS.map(
                  (
                    key,
                    index
                  ) => {
                    const Icon =
                      PRAYER_ICONS[
                        key
                      ];

                    const isNext =
                      key ===
                      nextPrayer.key;

                    const prayerDate =
                      getPrayerDate(
                        key,
                        prayers,
                        now
                      );

                    const hasPassed =
                      key !==
                        'Sunrise' &&
                      prayerDate <=
                        now;

                    return (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay:
                            index *
                            0.08,
                        }}
                        key={key}
                        className={`
                          flex flex-col items-center
                          p-3 rounded-xl
                          min-w-[72px]
                          md:min-w-[82px]
                          border
                          transition-all

                          ${
                            isNext
                              ? 'bg-primary text-white border-gold shadow-md scale-105'
                              : hasPassed
                                ? 'bg-primary/5 text-muted border-border opacity-70'
                                : 'bg-card text-text border-border hover:border-gold/50'
                          }
                        `}
                      >
                        <Icon
                          className={`
                            w-5 h-5 mb-2

                            ${
                              isNext
                                ? 'text-gold'
                                : hasPassed
                                  ? 'text-muted'
                                  : 'text-primary/70 dark:text-gold/70'
                            }
                          `}
                        />

                        <span className="text-xs font-bold mb-1">
                          {
                            PRAYER_NAMES[
                              key
                            ]
                          }
                        </span>

                        <span
                          className="text-sm font-mono font-bold"
                          style={{
                            direction:
                              'ltr',
                          }}
                        >
                          {formatTime(
                            prayers[
                              key
                            ]
                          )}
                        </span>
                      </motion.div>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* Footer */}
          {/* ============================================================ */}

          <div className="mt-4 pt-4 border-t border-border/70">
            <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted text-center">
              <Heart
                className="w-4 h-4 text-gold shrink-0"
                fill="currentColor"
              />

              <span>
                اللهم أعنّا على ذكرك وشكرك وحسن عبادتك
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};