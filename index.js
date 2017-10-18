const api = require('groupme').Stateless
const async = require('async')

const order66 = {
	execute: (apiKey, groupId) => new Promise((reject, resolve) => {
		api.Groups.show(apiKey, groupId, (err, group) => {
			if(err) return reject(err)
			let targets = group.members
			if(!targets) return reject(new Error('Members property unavailable'))
			api.Users.me(apiKey, (err, myId) => {
				if(err) return reject(err)
				let ids = targets.map(target => target.user_id)
				let me = ids.indexOf(myId)
				targets = targets.map(target => target.id)
				targets.splice(me, 1)
				let moves = []
				let base = (id) => api.Members.remove(apiKey, id, () => {}) // No error handling, since we're going to fail with the owner anyway
				let leave = () => { base(me); return resolve() }
				targets.forEach(target => moves.push(base.bind(null, target)))
				async.parallel(moves, leave)
			})
		})
	})
}

module.exports = order66.execute