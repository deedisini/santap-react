import { firebase } from './auth.js';
import { createAccount } from './accounts.js';
import { invite, validEmail } from './email.js';

const [mode, email, ...nameParts] = process.argv.slice(2);
if (!['existing', 'create', 'invite'].includes(mode) || !validEmail(email)) {
  console.error('Usage: npm run bootstrap-admin -- existing|create|invite email [Full Name]');
  process.exitCode = 1;
} else {
  const { auth, db } = firebase();
  try {
    if (mode === 'create') {
      const result = await createAccount({ email, name: nameParts.join(' '), role: 'Admin' }, { auth, db });
      console.log(JSON.stringify(result));
      if (!result.invitationSent) process.exitCode = 2;
    } else {
      const user = await auth.getUserByEmail(email);
      if (mode === 'existing') {
        await db.collection('users').doc(user.uid).set({ email: user.email, name: nameParts.join(' ') || user.displayName || user.email, role: 'Admin' }, { merge: true });
        console.log(`Admin profile ready: ${user.uid}`);
      } else {
        const profile = await db.collection('users').doc(user.uid).get();
        if (profile.data()?.role !== 'Admin') throw new Error('Target must have an Admin profile.');
        await invite(auth, user.uid);
        console.log(`Invitation sent: ${user.uid}`);
      }
    }
  } catch (error) {
    console.error(error.code || 'bootstrap_failed', error.message);
    process.exitCode = 1;
  }
}
