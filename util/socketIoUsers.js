const users = [];

const addUser = ({ id, name, room }) => {
  const existingUser = users.find(
    (user) => user.name === name && user.room === room && user.id === id
  );

  if (existingUser) {
    return { errorMessage: "این کاربر از قبل وجود دارد" };
  }

  const user = { id, name, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const userIndex = users.findIndex((user) => user.id === id);

  if (userIndex !== -1) {
    return users.splice(userIndex, 1)[0];
  }
};

const getCurrentUser = (id) => users.find((user) => user.id === id);

const getUsersInCurrentRoom = (room) =>
  users.filter((user) => user.room === room);

module.exports = {
  addUser,
  removeUser,
  getCurrentUser,
  getUsersInCurrentRoom,
};
