const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("memo.db");

class Memo {
  async referMemo () {
    const questionText = "Choose a note you want to refer";
    const answer = await this.enquirer(questionText);
    console.log(answer.memo.title);
    const contentLine = answer.memo.content.split("  |  ");
    for (let i = 0; i < contentLine.length; i++) {
      console.log(contentLine[i]);
    }
  }

  async deleteMemo () {
    const questionText = "Choose a note you want to delete";
    const answer = await this.enquirer(questionText);
    this.deleteData(answer.memo.id);
  }

  async enquirer (questionText) {
    const Enquirer = require("enquirer");
    const memoLine = await this.getData();
    if (!memoLine.length) {
      console.log("No memo has been created");
      process.exit(1);
    }
    return new Promise((resolve) => {
      const question = [
        {
          type: "select",
          name: "memo",
          message: questionText,
          choices: memoLine,
          result (value) {
            return this.choices.find(choices => choices.name === value);
          }
        }
      ];
      resolve(Enquirer.prompt(question));
    });
  }

  async displayMemoList () {
    const memoLine = await this.getData();
    if (!memoLine.length) {
      console.log("No memo has been created");
      process.exit(1);
    }
    memoLine.forEach(memoElement => {
      console.log(memoElement.title);
    });
  }

  async createMemo () {
    process.stdin.setEncoding("utf8");
    const input = [];
    const rl = require("readline").createInterface({
      input: process.stdin
    });
    rl.on("line", (line) => {
      input.push(line);
    });
    rl.on("close", () => {
      this.insertData(input);
    });
  }

  displayUsageAndExit () {
    const path = require("path");
    const basename = path.basename(process.argv[1]);
    console.log(`Usage:
  
    Create Memo       : echo '<contents>' | node ${basename}
  
    Refer Memo        : node ${basename} -r
    
    Display Memo List : node ${basename} -l
  
    Delete Memo       : node ${basename} -d
    `);
  }
}

class StorageDB extends Memo {
  constructor () {
    super();
    db.run("CREATE TABLE IF NOT EXISTS memodb (id INTEGER PRIMARY KEY, title TEXT, content TEXT)");
  }

  getData () {
    return new Promise((resolve) => {
      db.all("SELECT * FROM memodb", (err, rows) => {
        if (err) {
          throw err;
        }
        resolve(rows);
      });
    });
  }

  deleteData (memoId) {
    db.run(`DELETE FROM memodb WHERE id = ${memoId}`);
  }

  insertData (data) {
    const title = data.shift();
    if (!title.trim()) {
      console.log("Please enter text on the first line");
      process.exit(1);
    }
    const content = data.join("  |  ");
    const memo = db.prepare("INSERT INTO memodb(title, content) VALUES(?, ?)");
    memo.run(title, content);
    memo.finalize();
  }
}

db.serialize(() => {
  const storageDB = new StorageDB();
  const args = process.argv[2];
  if (args === "-r") {
    storageDB.referMemo();
  } else if (args === "-d") {
    storageDB.deleteMemo();
  } else if (args === "-l") {
    storageDB.displayMemoList();
  } else if (!process.stdin.isTTY) {
    storageDB.createMemo();
  } else {
    storageDB.displayUsageAndExit();
  }
});
