const { io } = require("socket.io-client");

const socket = io("ws://localhost:3000");

socket.on("ADD_MSG", (arg) => {
    console.log(`${arg}`);
})

let readline = require('readline')
let rl_interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl_interface.question("\nEnter Nickname: ", function (input) {
    socket.emit("SET_NICKNAME", input);
    rl_interface.close();
    rl_interface.removeAllListeners();

    rl_interface = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    // Clear the screen
    process.stdout.write('\x1b33[2J');
    process.stdout.write('\u001b[H\u001b[2J\u001b[3J');
    WaitForInput();

});

let WaitForInput = function () {
    rl_interface.question("", function (input) {
        if (input == "!QUIT") {
            socket.disconnect()
            rl_interface.close();
        } else {
            readline.moveCursor(process.stdout, 0, -1);
            readline.clearScreenDown();
            socket.emit("NEW_MSG", input)
            WaitForInput();

        }
    });
};
