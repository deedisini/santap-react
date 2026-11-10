import { Bell, Check, X } from "lucide-react";
import { useState } from "react";

const demoRoles = [
  ["Mahasiswa", "Mahasiswa"],
  ["Staff", "Staff Dining Hall"],
  ["Supervisor", "Supervisor"],
  ["Head", "Kepala Dining Hall"],
  ["Admin", "Administrator"],
];

export default function Topbar({ role, roleLabel = role, studentName, demoMode = false, onDemoRoleChange, notifications = [] }) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState([]);
  const unread = notifications.filter(item => !readIds.includes(item.id));
  function markAllRead() { setReadIds(current => [...new Set([...current, ...notifications.map(item => item.id)])]); }
  return (
    <header className="topbar">
      <div><span className="eyebrow">FERN WALLACE DINING HALL</span><h1>Sistem Antrean dan Pencatatan Aktivitas Pengambilan</h1></div>
      <div className="topbar-actions">
        {demoMode && <label className="role-select demo-role-select"><span>Demo</span><select aria-label="Pilih role demo" value={role} onChange={e => onDemoRoleChange?.(e.target.value)}>{demoRoles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>}
        <div className="notification-menu"><button className={`icon-button notification-trigger ${unread.length ? "has-unread" : ""}`} title="Notifikasi" aria-label={`Notifikasi${unread.length ? `, ${unread.length} belum dibaca` : ""}`} aria-expanded={open} onClick={() => setOpen(current => !current)}><Bell size={18} />{unread.length > 0 && <span className="notification-count">{unread.length}</span>}</button>{open && <div className="notification-popover" role="dialog" aria-label="Notifikasi"><div className="notification-header"><b>Notifikasi</b>{notifications.length > 0 && <button type="button" className="notification-action" onClick={markAllRead}><Check size={13} /> Tandai dibaca</button>}</div>{notifications.length ? <div className="notification-list">{notifications.map(item => <div className={`notification-item ${item.tone}`} key={item.id}><span className="notification-dot" /><div><b>{item.title}</b><p>{item.message}</p></div></div>)}</div> : <div className="notification-empty"><X size={16} /><span>Belum ada notifikasi aktif.</span></div>}</div>}</div>
        <div className="user-chip"><div className="avatar">{(studentName || roleLabel).slice(0, 1)}</div><div><b>{studentName || roleLabel}</b><span>{roleLabel}</span></div></div>
      </div>
    </header>
  );
}
