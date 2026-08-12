// 매일 정해진 시각에 자동으로 번호를 섞는 Netlify 예약 함수
// 아무도 사이트에 접속하지 않아도 이 함수는 Netlify 서버에서 스스로 실행됩니다.

const DB_URL = 'https://karaoke-book-db128-default-rtdb.firebaseio.com';

export default async () => {
  try {
    const res = await fetch(`${DB_URL}/songs.json`);
    const songs = await res.json();

    if (!songs) {
      return new Response('등록된 곡이 없어요', { status: 200 });
    }

    const numbers = Object.keys(songs);
    const payloads = numbers.map(n => songs[n]);

    // Fisher-Yates: 번호는 그대로 두고 곡 내용만 섞기
    for (let i = payloads.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [payloads[i], payloads[j]] = [payloads[j], payloads[i]];
    }

    const updated = {};
    numbers.forEach((n, i) => { updated[n] = payloads[i]; });

    await fetch(`${DB_URL}/songs.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });

    await fetch(`${DB_URL}/meta/lastShuffle.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Date.now())
    });

    return new Response(`${numbers.length}곡 번호를 자동으로 섞었어요`, { status: 200 });
  } catch (err) {
    return new Response('오류: ' + err.message, { status: 500 });
  }
};

// 매일 UTC 04:00 = 한국시간(KST) 오후 1시(13:00)에 실행
export const config = {
  schedule: '0 4 * * *'
};
