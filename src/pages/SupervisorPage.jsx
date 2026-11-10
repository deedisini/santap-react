import { useMemo } from "react";
import {
  BellRing,
  CheckCircle2,
  Clock3,
  Users,
  TrendingUp,
  CalendarDays,
} from "lucide-react";

import StatCard from "../components/StatCard";
import EmailReportPanel from "../components/EmailReportPanel";

export default function SupervisorPage({
  user,
  demoMode,
  students,
  records,
  demoHistory,
  queue,
  period,
  periodId,
  periodOpen,
  setPeriodOpen,
  reminder,
  setReminder,
}) {
  const studentByNim = useMemo(
    () => new Map(students.map((student) => [student.nim, student])),
    [students]
  );

  const periodRecords = useMemo(
    () => records.filter((record) => record.period === period),
    [records, period]
  );

  const residents = useMemo(
    () =>
      periodRecords.filter(
        (record) =>
          studentByNim.get(record.nim)?.residence === "Penghuni Asrama"
      ).length,
    [periodRecords, studentByNim]
  );

  const nonResidents = periodRecords.length - residents;

  const waiting = useMemo(
    () => queue.filter((item) => item.status === "waiting").length,
    [queue]
  );

  const recent = useMemo(
    () => [...records].slice(-5).reverse(),
    [records]
  );

  const weeklyRows = useMemo(() => {
    const today = new Date();

    const dateKey = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    return Array.from({ length: 7 }, (_, index) => {
      const daysAgo = 6 - index;
      const date = new Date(today);

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - daysAgo);

      const key = dateKey(date);

      const demoDay = demoHistory?.find(
        (item) => item.daysAgo === daysAgo
      );

      const dayRecords = records.filter(
        (record) => record.date === key
      );

      const count = (sessionId) =>
        dayRecords.filter(
          (record) =>
            record.periodId === sessionId ||
            (!record.periodId &&
              record.period ===
                (sessionId === "morning"
                  ? "Pagi"
                  : sessionId === "afternoon"
                    ? "Siang"
                    : "Malam"))
        ).length;

      const morning = demoDay?.morning ?? count("morning");
      const afternoon = demoDay?.afternoon ?? count("afternoon");
      const evening = demoDay?.evening ?? count("evening");

      return {
        key,
        label: date.toLocaleDateString("id-ID", {
          weekday: "short",
        }),
        date: date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        }),
        morning,
        afternoon,
        evening,
        total: morning + afternoon + evening,
      };
    });
  }, [demoHistory, records]);

  const weeklyTotals = useMemo(
    () =>
      weeklyRows.reduce(
        (totals, row) => ({
          morning: totals.morning + row.morning,
          afternoon: totals.afternoon + row.afternoon,
          evening: totals.evening + row.evening,
          total: totals.total + row.total,
        }),
        {
          morning: 0,
          afternoon: 0,
          evening: 0,
          total: 0,
        }
      ),
    [weeklyRows]
  );

  const weeklyMean = useMemo(
    () => ({
      morning: Math.round(weeklyTotals.morning / weeklyRows.length),
      afternoon: Math.round(weeklyTotals.afternoon / weeklyRows.length),
      evening: Math.round(weeklyTotals.evening / weeklyRows.length),
    }),
    [weeklyRows, weeklyTotals]
  );

  const residentPercentage = periodRecords.length
    ? (residents / periodRecords.length) * 100
    : 0;

  const nonResidentPercentage = periodRecords.length
    ? (nonResidents / periodRecords.length) * 100
    : 0;

  return (
    <div className="stack supervisor-page">
      <section className="stats-grid">
        <StatCard
          label="Total pengambilan"
          value={periodRecords.length}
          note={`Periode ${period}`}
          icon={Users}
        />

        <StatCard
          label="Penghuni asrama"
          value={residents}
          note="Catatan periode ini"
          icon={CheckCircle2}
          tone="blue"
        />

        <StatCard
          label="Non-penghuni"
          value={nonResidents}
          note="Catatan periode ini"
          icon={Users}
          tone="orange"
        />

        <StatCard
          label="Antrean menunggu"
          value={waiting}
          note="Seluruh antrean aktif"
          icon={Clock3}
          tone="purple"
        />
      </section>

      <section className="two-columns supervisor-overview">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">RINGKASAN</span>
              <h2>Distribusi pengguna</h2>
              <p>Komposisi mahasiswa berdasarkan tempat tinggal.</p>
            </div>
            <div className="panel-heading-icon">
              <Users size={19} />
            </div>
          </div>

          <div className="distribution">
            <div className="distribution-item">
              <div className="distribution-label">
                <span>Penghuni asrama</span>
                <b>{residents}</b>
              </div>

              <div
                className="progress"
                role="progressbar"
                aria-label="Persentase penghuni asrama"
                aria-valuenow={Math.round(residentPercentage)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span
                  style={{ width: `${residentPercentage}%` }}
                />
              </div>

              <span className="distribution-percentage">
                {residentPercentage.toFixed(1)}%
              </span>
            </div>

            <div className="distribution-item">
              <div className="distribution-label">
                <span>Non-penghuni</span>
                <b>{nonResidents}</b>
              </div>

              <div
                className="progress orange-progress"
                role="progressbar"
                aria-label="Persentase non-penghuni"
                aria-valuenow={Math.round(nonResidentPercentage)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span
                  style={{ width: `${nonResidentPercentage}%` }}
                />
              </div>

              <span className="distribution-percentage">
                {nonResidentPercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="panel-footnote">
            <TrendingUp size={15} />
            <p>
              Perhitungan berdasarkan catatan pengambilan pada periode
              yang sedang dipilih.
            </p>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">PENGATURAN</span>
              <h2>Operasional</h2>
              <p>Kontrol status periode dan pengingat.</p>
            </div>

            <div className="panel-heading-icon">
              <BellRing size={19} />
            </div>
          </div>

          <div className="period-control">
            <div className="operational-info">
              <span className="operational-label">Status periode</span>
              <b>
                {periodOpen
                  ? "Penerimaan pengambilan dibuka"
                  : "Penerimaan pengambilan ditutup"}
              </b>
              <span>
                {periodOpen
                  ? "Mahasiswa dapat melakukan pengambilan."
                  : "Pengambilan sedang tidak tersedia."}
              </span>
            </div>

            <span
              className={`status-pill ${
                periodOpen ? "success" : "warning"
              }`}
            >
              <span className="status-dot" />
              {periodOpen ? "Dibuka" : "Ditutup"}
            </span>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <b>Reminder penutupan</b>
              <span>
                Pengingat aktif saat periode mendekati waktu penutupan.
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={reminder}
              aria-label="Reminder penutupan"
              className={`toggle ${reminder ? "on" : ""}`}
              onClick={() => setReminder((current) => !current)}
            >
              <span />
            </button>
          </div>
        </article>
      </section>

      <section className="panel weekly-history-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">PERENCANAAN PORSI</span>
            <h2>Histori mahasiswa per sesi</h2>
            <p>
              Jumlah pengambilan aktual selama tujuh hari terakhir
              dibandingkan dengan target porsi.
            </p>
          </div>

          <div className="panel-heading-icon">
            <CalendarDays size={19} />
          </div>
        </div>

        <div className="weekly-summary">
          <div className="weekly-summary-heading">
            <span>Rata-rata harian</span>
            <small>7 hari terakhir</small>
          </div>

          <div className="portion-targets">
            <div>
              <span>Sarapan</span>
              <b>{weeklyMean.morning}</b>
            </div>

            <div>
              <span>Siang</span>
              <b>{weeklyMean.afternoon}</b>
            </div>

            <div>
              <span>Malam</span>
              <b>{weeklyMean.evening}</b>
            </div>
          </div>
        </div>

        <div className="weekly-table-wrap">
          <table className="weekly-table">
            <thead>
              <tr>
                <th>Hari</th>
                <th>Sarapan</th>
                <th>Siang</th>
                <th>Malam</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {weeklyRows.map((row) => (
                <tr key={row.key}>
                  <td>
                    <b>{row.label}</b>
                    <span>{row.date}</span>
                  </td>
                  <td>{row.morning}</td>
                  <td>{row.afternoon}</td>
                  <td>{row.evening}</td>
                  <td>
                    <strong>{row.total}</strong>
                  </td>
                </tr>
              ))}

              <tr className="weekly-total-row">
                <td>
                  <b>Total 7 hari</b>
                </td>
                <td>
                  <b>{weeklyTotals.morning}</b>
                </td>
                <td>
                  <b>{weeklyTotals.afternoon}</b>
                </td>
                <td>
                  <b>{weeklyTotals.evening}</b>
                </td>
                <td>
                  <b>{weeklyTotals.total}</b>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="helper-text weekly-note">
          Gunakan rata-rata harian sebagai dasar estimasi porsi
          berikutnya. Sesuaikan perhitungan jika terdapat hari khusus
          atau perubahan jadwal.
        </p>
      </section>

      <EmailReportPanel
        user={user}
        demoMode={demoMode}
        weeklyRows={weeklyRows}
        weeklyMean={weeklyMean}
        period={period}
      />

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">AKTIVITAS TERBARU</span>
            <h2>Catatan pengambilan</h2>
            <p>Lima catatan pengambilan terbaru dari seluruh periode.</p>
          </div>
        </div>

        {recent.length > 0 ? (
          <div className="records-table-wrap">
            <div className="records-table">
              <div className="records-head">
                <span>Mahasiswa</span>
                <span>NIM</span>
                <span>Periode</span>
                <span>Waktu</span>
              </div>

              {recent.map((record) => {
                const student = studentByNim.get(record.nim);

                return (
                  <div className="records-row" key={record.id}>
                    <b>{student?.name || record.nim}</b>
                    <span>{record.nim}</span>
                    <span>{record.period}</span>
                    <span>{record.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Clock3 size={22} />
            </div>
            <b>Belum ada aktivitas</b>
            <span>
              Catatan pengambilan mahasiswa akan muncul di sini.
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
