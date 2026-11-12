import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Clock3 } from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot, where } from "firebase/firestore";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import StudentPage from "./pages/StudentPage";
import StaffPage from "./pages/StaffPage";
import SupervisorPage from "./pages/SupervisorPage";
import AdminPage from "./pages/AdminPage";
import FeedbackPanel from "./components/FeedbackPanel";
import LoginPage from "./pages/LoginPage";
import { demoWeeklyHistory, initialQueue, initialRecords, mealPeriods, students } from "./data/demoData";
import { currentTime, todayKey } from "./utils/format";
import { auth, db, firebaseEnabled, firebaseSetupHint } from "./lib/firebase";
import { subscribeCollection, subscribeUserProfile } from "./lib/santap";
import { createSqlMealRecord, createSqlQueueEntry, loadSqlData, sqlEnabled, updateSqlMealPeriod } from "./lib/sqlApi";
import { buildNotifications } from "./utils/closingNotifications";
import { DEFAULT_OPERATIONS, activePeriod, periodWindow, isSabbath, TIME_ZONE } from '../shared/operations.js';
import { serviceRequest } from './lib/serviceApi.js';
import { cancelSqlQueue } from './lib/sqlApi.js';
import OperationsClock from './components/OperationsClock.jsx';
import OperationsSettings from './components/OperationsSettings.jsx';
import ProfileEditor from './components/ProfileEditor.jsx';
import PushControls from './components/PushControls.jsx';
import PendingScans from './components/PendingScans.jsx';
import { unregisterDevicePush } from './lib/pushRegistration.js';

const VALID_ROLES = ["Mahasiswa", "Staff", "Supervisor", "Head", "Admin"];

function ProfileRequired({ onLogout, reason, profileError }) {
  return <main className="access-shell"><section className="panel access-panel"><span className="eyebrow">AKUN BELUM SIAP</span><h1>Profil SANTAP belum lengkap</h1><p>{reason}</p><p className="helper-text">{profileError ? "Periksa Firebase Console: pastikan Firestore Rules sudah dipublikasikan dan akun ini boleh membaca dokumen users." : <>Administrator perlu melengkapi dokumen <code>users/{"{UID}"}</code> di Firestore dengan field <code>role</code>. Mahasiswa juga membutuhkan field <code>nim</code>.</>}</p><button className="button primary" onClick={onLogout}>Keluar</button></section></main>;
}

export default function App() {
  const [user, setUser] = useState(firebaseEnabled ? undefined : { uid: "demo", email: "demo@santap.local" });
  const [demoSession, setDemoSession] = useState(!firebaseEnabled);
  const [adminWorkspace, setAdminWorkspace] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(!firebaseEnabled);
  const [dataLoaded, setDataLoaded] = useState(!firebaseEnabled);
  const [role, setRole] = useState(firebaseEnabled ? null : "Mahasiswa");
  const [page, setPage] = useState("Dashboard");
  const [selectedNim, setSelectedNim] = useState(students[0].nim);
  const [studentList, setStudentList] = useState(students);
  const [queue, setQueue] = useState(initialQueue);
  const [publicQueue, setPublicQueue] = useState([]);
  const [config, setConfig] = useState(DEFAULT_OPERATIONS);
  const [records, setRecords] = useState(initialRecords);
  const [periodList, setPeriodList] = useState(mealPeriods);
  const [periodId, setPeriodId] = useState(() => activePeriod()?.id || 'morning');
  const [reminder, setReminder] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const recordBusy = useRef(false);
  const [firebaseError, setFirebaseError] = useState("");
  const [profileError, setProfileError] = useState("");
  const isDemo = !firebaseEnabled || demoSession;
  const useSqlData = firebaseEnabled && !demoSession && sqlEnabled;
  const useFirebaseData = firebaseEnabled && !demoSession && !useSqlData;
  const isFirebaseStudent = !isDemo && role === "Mahasiswa";
  const studentNim = isFirebaseStudent ? profile?.nim : selectedNim;
  const student = useMemo(() => isFirebaseStudent ? profile : studentList.find(s => s.nim === studentNim) || (isDemo ? studentList[0] : null), [isDemo, isFirebaseStudent, profile, studentList, studentNim]);
  const periodObject = periodList.find(p => p.id === periodId) || periodList[0];
  const selectedWindow = periodWindow(periodId, now, config);
  const scheduled = activePeriod(now, config);
  const period = selectedWindow?.label || 'Pagi';
  const periodOpen = Boolean(selectedWindow?.active && periodObject?.pausedDate !== selectedWindow.date);
  const currentRecords = records.filter(record => record.date === todayKey(now));
  const currentQueue = queue.filter(item => item.periodId === periodId && (!item.date || item.date === todayKey(now)));
  const notifications = useMemo(() => ['Supervisor', 'Head'].includes(role) ? buildNotifications(Object.keys(config.schedules).map(id => ({ id, ...periodList.find(p => p.id === id) })), now, reminder, config) : [], [periodList, now, reminder, config, role]);
  useEffect(() => { if (scheduled?.id) setPeriodId(scheduled.id); }, [scheduled?.id]);
  useEffect(() => {
    if (isDemo || !user || !profileLoaded || !role) return;
    return onSnapshot(doc(db, 'settings', 'operations'), snapshot => setConfig(snapshot.exists() ? snapshot.data() : DEFAULT_OPERATIONS), setFirebaseError);
  }, [isDemo, user, profileLoaded, role]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!useSqlData || !user || !role) return;
    let active = true, loading = false;
    const timer = window.setInterval(async () => {
      if (loading || document.hidden) return;
      loading = true;
      try {
        const data = await loadSqlData(user);
        if (active) { setStudentList(data.students); setQueue(data.queues); setRecords(data.mealRecords); setPeriodList(data.mealPeriods); }
      } catch (error) { if (active) setFirebaseError(error); }
      finally { loading = false; }
    }, 10000);
    return () => { active = false; clearInterval(timer); };
  }, [useSqlData, user, role]);

  useEffect(() => {
    if (!auth) return undefined;
    return onAuthStateChanged(auth, nextUser => { if (!demoSession) setUser(nextUser); });
  }, [demoSession]);
  useEffect(() => {
    if (!user || (!useFirebaseData && !useSqlData)) {
      setProfile(null); setProfileError(""); setProfileLoaded(true);
      if (isDemo) { setStudentList(students); setQueue(initialQueue); setRecords(initialRecords); setPeriodList(mealPeriods); setDataLoaded(true); setFirebaseError(""); }
      return undefined;
    }
    setProfileLoaded(false);
    setProfileError("");
    let active = true;
    setDataLoaded(false);
    setStudentList([]); setQueue([]); setRecords([]); setPeriodList([]);
    const cleanups = [subscribeUserProfile(user.uid, next => { setProfile(next); setProfileLoaded(true); setRole(next?.role || null); }, error => { setProfileError(error); setProfileLoaded(true); setFirebaseError(error); })];
    if (useFirebaseData && role) {
      if (role === "Mahasiswa" && profile?.nim) {
        // A student's own profile already contains the required identity and residence status.
        // Do not load every student just to render this one account.
        setStudentList([profile]);
        setDataLoaded(true);
        cleanups.push(
          subscribeCollection("queues", setQueue, setFirebaseError, [where("nim", "==", profile.nim)]),
          subscribeCollection("publicQueue", setPublicQueue, setFirebaseError),
          subscribeCollection("mealRecords", setRecords, setFirebaseError, [where("nim", "==", profile.nim)]),
          subscribeCollection("mealPeriods", setPeriodList, setFirebaseError),
        );
      } else {
        cleanups.push(
          subscribeCollection("students", next => { setStudentList(next); setDataLoaded(true); }, error => { setFirebaseError(error); setDataLoaded(true); }),
          subscribeCollection("queues", setQueue, setFirebaseError),
          subscribeCollection("mealRecords", setRecords, setFirebaseError),
          subscribeCollection("mealPeriods", setPeriodList, setFirebaseError),
        );
      }
    }
    if (useSqlData) {
      loadSqlData(user).then(data => {
        if (!active) return;
        setStudentList(data.students);
        setQueue(data.queues);
        setRecords(data.mealRecords);
        setPeriodList(data.mealPeriods);
        setDataLoaded(true);
      }).catch(error => { if (active) { setFirebaseError(error); setDataLoaded(true); } });
    }
    return () => { active = false; cleanups.forEach(cleanup => cleanup()); };
  }, [user, useFirebaseData, useSqlData, role, profile?.nim]);
  useEffect(() => {
    if (profile?.nim) setSelectedNim(profile.nim);
  }, [profile?.nim]);
  useEffect(() => {
    if (!role) return;
    setPage(role === "Staff" ? "Antrean & Validasi" : ["Supervisor", "Head"].includes(role) ? "Monitoring" : role === "Admin" ? "Kelola Akun" : "Dashboard");
  }, [role]);

  async function refreshSqlData() {
    const data = await loadSqlData(user);
    setStudentList(data.students); setQueue(data.queues); setRecords(data.mealRecords); setPeriodList(data.mealPeriods);
  }

  async function addQueue(nim) {
    if (!periodOpen) return { ok: false, message: "Periode makan sedang ditutup." };
    if (currentRecords.some(r => r.nim === nim && r.period === period)) return { ok: false, message: "Mahasiswa sudah memiliki catatan pengambilan." };
    if (currentQueue.some(q => q.nim === nim && q.status === "waiting")) return { ok: false, message: "Mahasiswa sudah berada dalam antrean." };
    if (useSqlData) { await createSqlQueueEntry({ nim, periodId }, user); await refreshSqlData(); }
    else if (useFirebaseData) await serviceRequest('/api/operations/queue', { nim, periodId }, user);
    else setQueue(prev => [...prev, { id: Date.now(), nim, periodId, status: "waiting", joinedAt: currentTime() }]);
    return { ok: true, message: "Mahasiswa berhasil ditambahkan ke antrean." };
  }
  async function saveRecord(nim) {
    if (recordBusy.current) return { ok: false, message: 'Pencatatan sedang diproses.' };
    if (!periodOpen) return { ok: false, message: "Periode makan sudah ditutup." };
    const found = studentList.find(s => s.nim === nim);
    if (!found) return { ok: false, message: "Identitas mahasiswa tidak valid." };
    if (currentRecords.some(r => r.nim === nim && r.period === period)) return { ok: false, message: "Pengambilan untuk periode ini sudah tercatat." };
    recordBusy.current = true;
    try {
    if (useSqlData) {
      const saved = await createSqlMealRecord({ nim, periodId, period, staffName: profile?.name || user.email }, user);
      await refreshSqlData();
      return { ok: true, message: `Pengambilan ${found.name} berhasil dicatat.`, record: saved };
    }
    if (useFirebaseData) {
      const saved = await serviceRequest('/api/operations/meal', { nim, periodId }, user);
      return { ok: true, message: `Pengambilan ${found.name} berhasil dicatat.`, record: saved };
    }
    const saved = { id: Date.now(), nim, periodId, period, date: todayKey(), time: currentTime(), staff: "Staff Demo", studentName: found.name, verificationToken: crypto.randomUUID() };
    setRecords(prev => [...prev, saved]); setQueue(prev => prev.map(q => q.nim === nim && q.periodId === periodId && q.status === "waiting" ? { ...q, status: "completed", recordId: saved.id } : q));
    return { ok: true, message: `Pengambilan ${found.name} berhasil dicatat.`, record: saved };
    } finally { recordBusy.current = false; }
  }
  async function completeQueue(id) { const item = currentQueue.find(q => q.id === id); return item ? saveRecord(item.nim) : { ok: false, message: "Data antrean tidak ditemukan untuk periode ini." }; }
  async function togglePeriod(nextOpen) {
    try {
      if (useSqlData) { await updateSqlMealPeriod(periodId, nextOpen, user); await refreshSqlData(); }
      else if (useFirebaseData) await serviceRequest('/api/operations/period', { periodId, active: nextOpen }, user);
      else {
        if (nextOpen && !selectedWindow?.active) throw new Error('Tidak dapat membuka layanan di luar jadwal.');
        setPeriodList(prev => prev.map(p => p.id === periodId ? { ...p, pausedDate: nextOpen ? null : todayKey() } : p));
      }
    } catch (error) { setFirebaseError(error); }
  }
  async function logout() { await unregisterDevicePush(user); setAdminWorkspace(false); if (demoSession) { setDemoSession(false); setUser(null); return; } if (auth) await signOut(auth); else setUser(null); }
  async function cancelQueue(id) {
    if (useSqlData) { await cancelSqlQueue(id, user); await refreshSqlData(); }
    else if (useFirebaseData) await serviceRequest('/api/operations/cancel', { id }, user);
    else setQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'cancelled' } : item));
  }
  function changeDemoRole(nextRole) { if (isDemo && VALID_ROLES.includes(nextRole)) setRole(nextRole); }
  async function enterDemoRole(nextRole) {
    if (!VALID_ROLES.includes(nextRole)) return;
    if (!isDemo && auth) { await unregisterDevicePush(user); await signOut(auth); }
    setDemoSession(true);
    setProfile(null);
    setProfileError("");
    setFirebaseError("");
    setAdminWorkspace(true);
    setRole(nextRole);
    setUser({ uid: "demo", email: "demo@santap.local" });
  }
  if (user === undefined || (!isDemo && user && !profileLoaded)) return <main className="loading-shell">Memeriksa profil SANTAP...</main>;
  if (!user) return <LoginPage />;
  if (!isDemo && (profileError || !profile || !VALID_ROLES.includes(profile.role) || (profile.role === "Mahasiswa" && !profile.nim))) {
    const reason = profileError ? "Aplikasi tidak bisa membaca profil Firebase akun ini." : !profile ? "Akun berhasil login, tetapi dokumen profilnya belum ditemukan." : !VALID_ROLES.includes(profile.role) ? "Field role belum berisi kategori akun yang dikenali." : "Profil mahasiswa belum memiliki field nim.";
    return <ProfileRequired onLogout={logout} reason={reason} profileError={profileError} />;
  }
  if (!isDemo && role === "Mahasiswa" && !dataLoaded) return <main className="loading-shell">Memuat data mahasiswa...</main>;
  if (!student && role === "Mahasiswa") return <ProfileRequired onLogout={logout} reason={firebaseError ? `Data mahasiswa belum dapat dimuat: ${firebaseError.message || firebaseError}` : `Data mahasiswa dengan NIM ${profile?.nim || "yang terdaftar"} belum ditemukan.`} />;
  const roleLabel = role === "Head" ? "Kepala Dining Hall" : role;
  return <div className={`app-shell ${isSabbath(now, config) ? 'sabbath-theme' : ''}`}><Sidebar role={role} page={page} setPage={setPage} onLogout={logout} adminWorkspace={adminWorkspace || role === "Admin"} adminDemoActive={adminWorkspace && isDemo} onDemoRoleChange={enterDemoRole} /><main className="main-area"><Topbar role={role} roleLabel={roleLabel} studentName={profile?.name || student?.name || roleLabel} demoMode={isDemo && !adminWorkspace} onDemoRoleChange={changeDemoRole} notifications={notifications} /><div className="content-area">
    {isSabbath(now, config) && <p className="sabbath-greeting">Selamat Sabat. Semoga hari ini membawa damai dan ketenangan.</p>}
    <div className="welcome-row"><div><span className="eyebrow">FERN WALLACE DINING HALL</span><h2>{page === "Dashboard" ? `Selamat datang, ${role === "Mahasiswa" ? student.name.split(" ")[0] : role}` : page}</h2><p>Kelola proses layanan Dining Hall dengan data yang tercatat.</p></div><div className="date-controls"><div className="date-chip"><CalendarDays size={15} /> {now.toLocaleDateString("id-ID", { timeZone: TIME_ZONE, day: "2-digit", month: "long", year: "numeric" })}</div><label className="period-select"><Clock3 size={15} /><select value={periodId} onChange={e => setPeriodId(e.target.value)}>{Object.keys(config.schedules).map(id => { const window = periodWindow(id, now, config); return <option key={id} value={id}>{window.label} · {window.open}–{window.close}</option>; })}</select></label></div></div>
    <OperationsClock now={now} config={config} periods={periodList} />
    {['Supervisor', 'Head'].includes(role) && <PushControls key={user.uid} user={user} demoMode={isDemo} notifications={notifications} reminder={reminder} />}
    {firebaseError && <div className="notice error-notice">Data server: {firebaseError.message || firebaseError}</div>}{!firebaseEnabled && <div className="notice">Mode demo lokal. {firebaseSetupHint}</div>}{useSqlData && <div className="notice">Firebase Auth aktif · data operasional tersimpan di MySQL.</div>}
    {isDemo && role === "Mahasiswa" && <div className="student-demo-select"><label htmlFor="student-demo">Akun mahasiswa demo</label><select id="student-demo" value={selectedNim} onChange={e => setSelectedNim(e.target.value)}>{studentList.map(s => <option key={s.nim} value={s.nim}>{s.name} ({s.nim})</option>)}</select></div>}
    {role === "Mahasiswa" && <StudentPage student={student} queue={currentQueue} publicQueue={useFirebaseData ? publicQueue.filter(item => item.periodId === periodId && item.date === todayKey()) : currentQueue} records={currentRecords} period={period} periodId={periodId} periodOpen={periodOpen} onJoinQueue={() => addQueue(student.nim)} />}
    {role === "Mahasiswa" && <FeedbackPanel user={user} demoMode={isDemo} period={period} />}
    {(role === "Staff" || (role === "Head" && page === "Antrean & Validasi")) && <><StaffPage students={studentList} queue={currentQueue} records={currentRecords} period={period} periodId={periodId} periodOpen={periodOpen} setPeriodOpen={togglePeriod} onAddQueue={addQueue} onRecord={saveRecord} onCompleteQueue={completeQueue} onCancelQueue={cancelQueue} /><PendingScans key={user.uid} user={user} demoMode={isDemo} students={studentList} periodId={periodId} config={config} useSqlData={useSqlData} onSaved={useSqlData ? refreshSqlData : async () => {}} /></>}
    {(role === "Supervisor" || (role === "Head" && page === "Monitoring")) && <SupervisorPage user={user} demoMode={isDemo} students={studentList} records={records} demoHistory={isDemo ? demoWeeklyHistory : null} queue={queue} period={period} periodId={periodId} periodOpen={periodOpen} setPeriodOpen={togglePeriod} reminder={reminder} setReminder={setReminder} />}
    {role === "Admin" && <><AdminPage user={user} demoMode={isDemo} /><ProfileEditor user={user} students={studentList} demoMode={isDemo} onSaved={async form => { if (isDemo) setStudentList(rows => rows.map(row => row.nim === form.nim ? { ...row, ...form } : row)); else if (useSqlData) await refreshSqlData(); }} /><OperationsSettings config={config} user={user} demoMode={isDemo} onDemoChange={setConfig} /></>}
    <footer className="footer-note">SANTAP · Sistem Antrean dan Pencatatan Aktivitas Pengambilan <span>{isDemo ? "Mode demo lokal" : "Firebase aktif"}</span></footer>
  </div></main></div>;
}
