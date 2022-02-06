const argv = require("minimist")(process.argv.slice(2));

const year = argv.y ? argv.y : new Date().getFullYear();
const month = argv.m ? argv.m : new Date().getMonth() + 1;

const FirstDay = new Date(year, month - 1, 1, 9);
const LastDay = new Date(year, month, 0, 9);

const dateList = [];
for (let Day = FirstDay.getDate(); Day <= LastDay.getDate(); Day++) {
  const dateElement = new Date(year, month - 1, Day, 9);
  dateList.push(dateElement);
}

console.log(`       ${month}月 ${year}`);
console.log(" 日 月 火 水 木 金 土");
process.stdout.write("   ".repeat(FirstDay.getDay()));
dateList.forEach(currentDate => {
  process.stdout.write(String(currentDate.getDate()).padStart(3, " "));
  if (currentDate.getDay() === 6) {
    process.stdout.write("\n");
  }
});
console.log("\n");
