const hash = location.hash.slice(1);
console.log(location.hash);

const table: { app?: string } = hash.split('&').reduce((table, pair) => {
  const [key, value] = pair.split('=');
  return { ...table, [key]: value };
}, {});

// location.hash = "";

export default table;