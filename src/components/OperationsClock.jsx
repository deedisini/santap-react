import { activePeriod, localParts, TIME_ZONE } from '../../shared/operations.js';
export default function OperationsClock({ now, config, periods }) {
  const current = activePeriod(now, config);
  const paused = current && periods.find(p => p.id === current.id)?.pausedDate === current.date;
  const warning = current?.warning && !paused;
  return <section className={`operations-clock ${warning ? 'closing-warning' : ''}`} aria-label="Waktu operasional Dining Hall">
    <div><span>Waktu Dining Hall</span><time dateTime={now.toISOString()}>{localParts(now).clock} <small>WITA</small></time><small>{TIME_ZONE}</small></div>
    <div role="status" aria-live="polite"><b>{current ? `${current.label}${paused ? ' dijeda' : ' berlangsung'}` : 'Di luar jam layanan'}</b><p>{current ? `Jadwal ${current.open}–${current.close} WITA.${warning ? ' Layanan segera ditutup.' : ''}` : 'Pengambilan dibuka kembali pada jadwal makan berikutnya.'}</p></div>
  </section>;
}
