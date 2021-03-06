import http from 'http'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import initializeDb from './db'
import middleware from './middleware'
import api from './api'
import config from './config.json'
import path from 'path'
import io from 'socket.io'




const app = express()
const server = http.createServer(app)
const sio = io(server)
// sio.attach(server)
//Static Site
app.use(express.static(path.join(__dirname, '../front-end-transpiled')))

// logger
app.use(morgan('dev'))

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}))

app.use(bodyParser.json({
	limit : config.bodyLimit
}))

// connect to db
initializeDb( db => {
	// internal middleware
	app.use(middleware({ config, db }));

	// api router
	app.use('/api', api({ config, db }));

	sio.on('connection', function(socket) {
		console.log('connecting')
		socket.emit('message', {
			data: 'world'
		});
		socket.on('my other event', function(data) {
			console.log(data);
		});
	});

	server.listen(process.env.PORT || config.port, () => {
		console.log(`Started on port ${server.address().port}`)
	})
})

export default app
