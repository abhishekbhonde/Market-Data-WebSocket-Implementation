export const loadChartData = (coin) => {
    const data = localStorage.getItem(coin);
    return data ? JSON.parse(data) : [];
  };
  
  export const saveChartData = (coin, data) => {
    localStorage.setItem(coin, JSON.stringify(data));
  };
  