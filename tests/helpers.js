const users = {
  1: { email: 'email@email.com', password: 'hello' },
  2: { email: 'another@email.com', password: 'pizza' },
  3: { email: 'thelast@email.com', password: 'late at night' }
};

export function fetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(users[id])
    }, 1000);
  })
}

export
function createUser(user) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const newId = Object.keys(users).length + 1;
      users[newId] = user;
      resolve(users[newId]);
    }, 1000)
  });
}
