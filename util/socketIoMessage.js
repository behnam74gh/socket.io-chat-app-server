exports.formatMessage = ({ user, message }) => {
  return {
    user,
    message,
    time: Date.now(),
  };
};
