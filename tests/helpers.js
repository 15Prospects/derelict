const users = {
  1: { email: 'email@email.com', password: 'hello', role: 1 },
  2: { email: 'another@email.com', password: 'pizza', role: 1 },
  3: { email: 'thelast@email.com', password: 'late at night', role: 1 }
};

export function fetchUser({ email }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let user = {};
      Object.keys(users).forEach(value => {
        if ( users[value].email === email ) {
          user = users[value];
        }
      });
      resolve(user)
    }, 1000);
  })
}

export function createUser(user) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const newId = Object.keys(users).length + 1;
      user.role = 1;
      users[newId] = Object.assign({}, user);
      resolve(user);
    }, 1000)
  });
}

export const authRules = {
  pass(user) {
    return user.role === 1
  },
  
  fail(user) {
    return user.role === 2
  }
};
