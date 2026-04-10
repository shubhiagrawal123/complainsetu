const url = 'http://localhost:5000/api/auth/register';
const payload = { name: 'Test User', email: 'testuser@example.com', password: 'test1234' };

fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
})
    .then(async res => {
        console.log('STATUS', res.status, res.statusText);
        console.log(await res.text());
    })
    .catch(err => {
        console.error('FETCH ERROR', err);
    });