const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io').listen(server).sockets

app.get("/",(req,res) => {
	res.sendFile(__dirname+'/index.html')
})

let connectedUser = []


// 连接成功
io.on("connection",(socket) => {
	console.log("用户已连接") 
	updateUserName()

	let userName = ''

	// 监听登录事件
	socket.on('login',(name , callback) => {
		if(name.trim().length === 0) return 
		else{
			callback(true)
			userName=name
			connectedUser.push(userName)
			console.log('已连接用户列表：',connectedUser)
			updateUserName()
		}
	})

	// 收发消息
	socket.on('chat message',msg => {
		io.emit('outputMsg',{
			name:userName,
			msg:msg
		})
	})

	// 监听断开连接
	socket.on('disconnect',() => {
		console.log('用户已断开连接')
		connectedUser.splice(connectedUser.indexOf(userName),1)
		console.log('已连接用户列表：',connectedUser)
		updateUserName()
	})

	// 更新连接用户的列表
	function updateUserName(){
		io.emit('loadUser',connectedUser)
	}
	
})

const port =process.env.PORT || 8080

server.listen(port,() => {
	console.log('服务器运行成功，正在监听',port,"端口")
})