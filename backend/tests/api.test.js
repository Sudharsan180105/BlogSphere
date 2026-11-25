
import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL =
  process.env.API_BASE_URL || 'http://localhost:5001';

// --------------------------------------------------
// 1. API HEALTH TEST
// --------------------------------------------------

test('Health endpoint returns HTTP 200', async () => {
  const response = await fetch(`${BASE_URL}/api/health`);

  assert.equal(response.status, 200);

  const data = await response.json();

  assert.equal(data.success, true);
  assert.equal(data.status, 'Running');
});

// --------------------------------------------------
// 2. PUBLIC BLOG LISTING
// --------------------------------------------------

test('Public blog listing returns HTTP 200', async () => {
  const response = await fetch(`${BASE_URL}/api/blogs`);

  assert.equal(response.status, 200);

  const data = await response.json();

  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.blogs));
  assert.equal(typeof data.total, 'number');
  assert.equal(typeof data.page, 'number');
});

// --------------------------------------------------
// 3. PUBLISHED ARTICLE RETRIEVAL
// --------------------------------------------------

test('Published article can be retrieved by slug', async (t) => {
  const listResponse = await fetch(`${BASE_URL}/api/blogs`);

  assert.equal(listResponse.status, 200);

  const listData = await listResponse.json();

  if (listData.blogs.length === 0) {
    t.skip('No published articles are available');
    return;
  }

  const slug = listData.blogs[0].slug;

  const response = await fetch(
    `${BASE_URL}/api/blogs/${encodeURIComponent(slug)}`
  );

  assert.equal(response.status, 200);

  const data = await response.json();

  assert.equal(data.success, true);
  assert.equal(data.blog.slug, slug);
  assert.equal(data.blog.status, 'published');
});

// --------------------------------------------------
// 4. AUTHENTICATION PROTECTION
// --------------------------------------------------

test('My Blogs rejects requests without authentication', async () => {
  const response = await fetch(`${BASE_URL}/api/blogs/mine`);

  assert.equal(response.status, 401);

  const data = await response.json();

  assert.equal(data.success, false);
  assert.equal(
    data.message,
    'Authentication required. Please log in.'
  );
});

test('Profile endpoint rejects requests without authentication', async () => {
  const response = await fetch(`${BASE_URL}/api/users/me`);

  assert.equal(response.status, 401);

  const data = await response.json();

  assert.equal(data.success, false);
});

// --------------------------------------------------
// 5. JWT SECURITY
// --------------------------------------------------

test('Invalid JWT token is rejected', async () => {
  const response = await fetch(`${BASE_URL}/api/blogs/mine`, {
    headers: {
      Authorization: 'Bearer invalid.test.token',
    },
  });

  assert.equal(response.status, 401);

  const data = await response.json();

  assert.equal(data.success, false);
});

// --------------------------------------------------
// 6. AUTHENTICATION VALIDATION
// --------------------------------------------------

test('Login rejects invalid input', async () => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'not-an-email',
      password: '',
    }),
  });

  assert.equal(response.status, 400);

  const data = await response.json();

  assert.equal(data.success, false);
});

test('Registration rejects missing required fields', async () => {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  assert.equal(response.status, 400);

  const data = await response.json();

  assert.equal(data.success, false);
});

// --------------------------------------------------
// 7. BLOG MUTATION PROTECTION
// --------------------------------------------------

test('Blog creation rejects unauthenticated requests', async () => {
  const response = await fetch(`${BASE_URL}/api/blogs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  assert.equal(response.status, 401);
});

test('Blog editing rejects unauthenticated requests', async () => {
  const response = await fetch(
    `${BASE_URL}/api/blogs/invalid-blog-id`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Unauthorized edit',
      }),
    }
  );

  assert.equal(response.status, 401);
});

test('Blog deletion rejects unauthenticated requests', async () => {
  const response = await fetch(
    `${BASE_URL}/api/blogs/invalid-blog-id`,
    {
      method: 'DELETE',
    }
  );

  assert.equal(response.status, 401);
});

// --------------------------------------------------
// 8. ARTICLE ERROR HANDLING
// --------------------------------------------------

test('Unknown article slug returns HTTP 404', async () => {
  const response = await fetch(
    `${BASE_URL}/api/blogs/article-that-does-not-exist-qa-test`
  );

  assert.equal(response.status, 404);

  const data = await response.json();

  assert.equal(data.success, false);
});

// --------------------------------------------------
// 9. AUTHENTICATED BLOG OWNERSHIP SECURITY
// --------------------------------------------------

test('User B cannot edit User A blog', async (t) => {
  const blogId = process.env.QA_BLOG_ID;
  const tokenB = process.env.QA_USER_B_TOKEN;

  if (!blogId || !tokenB) {
    t.skip('QA_BLOG_ID or QA_USER_B_TOKEN is not configured');
    return;
  }

  const response = await fetch(
    `${BASE_URL}/api/blogs/${blogId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenB}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Unauthorized Ownership Edit',
      }),
    }
  );

  assert.equal(response.status, 404);

  const data = await response.json();

  assert.equal(data.success, false);
  assert.match(data.message, /permission/i);
});

test('User B cannot delete User A blog', async (t) => {
  const blogId = process.env.QA_BLOG_ID;
  const tokenB = process.env.QA_USER_B_TOKEN;

  if (!blogId || !tokenB) {
    t.skip('QA_BLOG_ID or QA_USER_B_TOKEN is not configured');
    return;
  }

  const response = await fetch(
    `${BASE_URL}/api/blogs/${blogId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokenB}`,
      },
    }
  );

  assert.equal(response.status, 404);

  const data = await response.json();

  assert.equal(data.success, false);
  assert.match(data.message, /permission/i);
});
