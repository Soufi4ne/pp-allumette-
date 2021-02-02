const inquirer = require('inquirer')
const _ = require('lodash')

class Allumette {
    line = 0
    matches = 0
    turn = 1
    board = [
        [' ', ' ', ' ', '|', ' ', ' ', ' '],
        [' ', ' ', '|', '|', '|', ' ', ' '],
        [' ', '|', '|', "|", '|', '|', ' '],
        ['|', '|', '|', '|', '|', '|', '|']
    ]
    qLine = [{
        type: 'input',
        name: 'line',
        message: "Line:",
    }]
    qMatches = [{
        type: 'input',
        name: 'matches',
        message: "Matches:",
    }]
    qRestart = [{
        type: 'input',
        name: 'restart',
        message: "Want to play again ? (yes : no):",
    }]
    restartA = null
    constructor() { }
    start() {
        console.log('$ node ailumette\n')
        this.displayMap()
        console.log('\n' + (this.turn ? 'Your turn:' : 'AI’s turn...'))
        this.round()
    }
    async restart() {
        while (this.restartA === null) {
            const restartA = await this.setRestartChoice()
            if (this.isValidEntry(restartA, 'restart')) {
                this.restartA = restartA
            }
        }
        if(this.restartA === 'yes') {
            this.board = [
                [' ', ' ', ' ', '|', ' ', ' ', ' '],
                [' ', ' ', '|', '|', '|', ' ', ' '],
                [' ', '|', '|', "|", '|', '|', ' '],
                ['|', '|', '|', '|', '|', '|', '|']
            ]
            this.restartA = null
            this.start()
        }
    }
    async round() {
        if (this.turn) {
            while (this.line === 0) {
                const line = await this.setLineOrMatches('line')
                if (this.isValidEntry(line, 'line')) {
                    this.line = line
                }
            }
            while (this.matches === 0) {
                const matches = await this.setLineOrMatches('matches')
                if (this.isValidEntry(matches, 'matches')) {
                    this.matches = matches
                }
            }
            this.updateBoard()
        } else {
            this.aiPlays()
        }
    }
    setLineOrMatches(type) {
        return new Promise(resolve => {
            inquirer.prompt(type === 'line' ? this.qLine : this.qMatches)
                .then(answer => {
                    resolve(parseInt(type === 'line' ? answer.line : answer.matches))
                })
        })
    }
    setRestartChoice() {
        return new Promise(resolve => {
         inquirer.prompt(this.qRestart)
            .then(answer => {
                 resolve(answer.restart)
              })
        })
    }
    aiPlays() {
        setTimeout(() => {
            const availableLines = []
            _.each(this.board, (line, i) => {
                if (_.countBy(line)["|"] > 0) {
                    availableLines.push(i + 1)
                }
            })
            this.line = availableLines[Math.floor(Math.random() * availableLines.length)]
            const matchesCount = _.countBy(this.board[this.line - 1])["|"]
            this.matches = Math.floor(Math.random() * (matchesCount > 3 ? 3 : matchesCount) + 1)
            this.updateBoard()
        }, 1000);
    }
    isValidEntry(value, type) {
        if (type === 'line' || type === 'matches') {
            const matchesCount = type === 'line'
                ? _.countBy(this.board[value - 1])["|"] || 0
                : _.countBy(this.board[this.line - 1])["|"] || 0
            if (value < 0 || typeof value !== 'number') {
                console.log('Error: bad input (positive number expected)')
                return false
            } else if (type === 'line') {
                if (value === 0 || value > 4) {
                    console.log('Error: line out of range :/ ')
                    return false
                } else if (matchesCount === 0) {
                    console.log('Error: no more matches here')
                    return false
                }
            } else if (type === 'matches') {
                if (value === 0) {
                    console.log('Error: remove one match')
                    return false
                } else if (value > 3) {
                    console.log('Error: maximum number of matches is 3')
                    return false
                } else if (value > matchesCount) {
                    console.log('Error: not enough matches on line')
                    return false
                }
            }
        } else if (type === 'restart') {
            value = value.trim().toLowerCase()
            if (value !== 'yes' && value !== 'no') {
                console.log(value)
                console.log('Error: bad input ("yes" ou "no" expected)')
                return false
            }
        }
        return true
    }
    updateBoard() {
        this.board[this.line - 1] = this.board[this.line - 1].fill(' ', (this.board[this.line - 1].lastIndexOf('|') + 1) - this.matches)

        let allMatchesCount = 0
        _.each(this.board, (line) => {
            allMatchesCount += _.countBy(line)["|"] || 0
        })
        console.log(`${this.turn ? 'Player' : 'AI'} removed ${this.matches} ${this.matches > 1 ? 'matches' : 'match'} from line ${this.line}`)
        this.displayMap()
        this.line = this.matches = 0
        if (allMatchesCount === 0) {
            console.log('\n' + (this.turn ? 'You lost, you are bad :) ' : 'I... L..Lost...'))
            this.restart()
        } else {
            this.turn = this.turn ? 0 : 1
            console.log('\n' + (this.turn ? 'Your turn:' : 'AI’s turn.'))
            this.round()
        }
    }
    displayMap() {
        console.log(' ********* ')
        _.each(this.board, (line) => {
            console.log('* ' + line.join('') + ' *')
        })
        console.log(' ********* ')
    }
}
const allumette = new Allumette()
allumette.start()
