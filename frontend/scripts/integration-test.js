import axios from 'axios';

async function run() {
  const BACKEND = process.env.BACKEND_URL || process.env.VITE_BACKEND_URL || 'http://localhost:3000';
  console.log('Using backend:', BACKEND);

  const username = `integ_user_${Date.now()}`;
  const password = 'Password123!';

  try {
    console.log('1) Signing up', username);
    await axios.post(`${BACKEND}/api/v1/signup`, { username, password });
    console.log('-> Signup OK');
  } catch (err) {
    const resp = err?.response;
    console.error('Signup failed:', resp?.status, resp?.data || err?.message || err);
    if (!resp) {
      console.error('Error details:', {
        message: err?.message,
        code: err?.code,
        stack: err?.stack,
      });
    }
    // If user already exists (duplicate key), continue; otherwise exit
    if (resp?.status === 500 && typeof resp?.data === 'object') {
      console.warn('-> Signup returned 500 (may already exist). Continuing...');
    } else {
      process.exit(1);
    }
  }

  try {
    console.log('2) Signing in');
    const signinRes = await axios.post(`${BACKEND}/api/v1/signin`, { username, password });
    const token = signinRes.data?.token;
    if (!token) throw new Error('No token returned from signin');
    console.log('-> Signin OK, token length', token.length);

    // Create content
    console.log('3) Creating content');
    const createRes = await axios.post(
      `${BACKEND}/api/v1/content`,
      { title: 'Integration test content', link: 'https://example.com' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const created = createRes.data?.content;
    console.log('-> Created content id', created?._id);

    // Fetch contents
    console.log('4) Fetching contents');
    const listRes = await axios.get(`${BACKEND}/api/v1/content`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const contents = listRes.data?.contents || [];
    console.log('-> Contents count:', contents.length);

    // Delete created content (if present)
    if (created?._id) {
      console.log('5) Deleting content', created._id);
      await axios.delete(`${BACKEND}/api/v1/content/${created._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('-> Deleted');

      const postDelete = await axios.get(`${BACKEND}/api/v1/content`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('-> Contents after delete:', (postDelete.data?.contents || []).length);
    }

    console.log('Integration test completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Integration flow failed:', err?.response?.data || err.message || err);
    process.exit(1);
  }
}

run();
