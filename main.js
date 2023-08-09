kaboom({
	background: [74, 48, 82],
})

loadSprite("bag", "./sprites/bag.png")
loadSprite("ghosty", "./sprites/ghosty.png")
loadSprite("grass", "./sprites/Wall.png")
loadSprite("steel", "./sprites/steel.png")
loadSprite("door", "./sprites/Gate3.png")
loadSprite("key", "./sprites/key.png")
loadSprite("bean", "./sprites/bean.png")
loadSprite("pineapple", "./sprites/pineapple.png")

scene("main", (levelIdx) => {

	const SPEED = 320

	// character dialog data
	const characters = {
		"a": {
			sprite: "bag",
			msg: "Hi Dav! Welcome to your own dungeon, your goal is to find the key. The controls are w a s d to move, good luck and be careful! ;) ",
		},
		"b": {
			sprite: "ghosty",
			msg: "Who are you? You can see me??",
		},
	}

	// level layouts
	const levels = [
		[	
			"                                         ",
			"                                         ",
			"         =========================||=====",
			"         =                              =",
			"         =                              =",
			"         =                              =",
			"         =                  $           =",
			"         =                              =",
			"         =                              =",
			"         =                              =",
			"         =                              =",
			"         =                              =",
			"         =                              =",
			"         =                              =",
			"         =                              =",
			"         =                              =",
			"         =                              =",
			"         =                              =",
			"         =  a @                         =",
			"         =                              =",
			"         =                              =",
			"         ================================",
		],
		[	
			"                                         ",
			"                                         ",
			"         =========================||=====",
			"         =                              =",
			"         =   $                          =",
			"         =                              =",
			"         =                              =",
			"         =                              =",
			"         =                              =",
			"         =                              =",
			"         =                              =",
			"         =                              =",
			"         =  a @                         =",
			"         =                              =",
			"         =                              =",
			"         ================================",
		],
	]

	const level = addLevel(levels[levelIdx], {
		tileWidth: 40,
		tileHeight: 40,
		pos: vec2(0, 30),
		tiles: {
			"=": () => [
				sprite("grass"),
				area(),
				body({ isStatic: true }),
				anchor("center"),
			],
			"-": () => [
				sprite("steel"),
				area(),
				body({ isStatic: true }),
				anchor("center"),
			],
			"$": () => [
				sprite("key"),
				area(),
				anchor("center"),
				"key",
			],
			"@": () => [
				sprite("bean"),
				area(),
				body(),
				anchor("center"),
				"player",
			],
			"|": () => [
				sprite("door"),
				area(),
				body({ isStatic: true }),
				anchor("center"),
				"door",
			],
		},
		// any() is a special function that gets called everytime there's a
		// symbole not defined above and is supposed to return what that symbol
		// means
		wildcardTile(ch) {
			const char = characters[ch]
			if (char) {
				return [
					sprite(char.sprite),
					area(),
					body({ isStatic: true }),
					anchor("center"),
					"character",
					{ msg: char.msg },
				]
			}
		},
	})

	// get the player game obj by tag
	const player = level.get("player")[0]

	function addDialog() {
		const h = 160
		const pad = 16
		const bg = add([
			pos(0, height() - h),
			rect(width(), h),
			color(0, 0, 0),
			z(100),
		])
		const txt = add([
			text("", {
				width: width(),
			}),
			pos(0 + pad, height() - h + pad),
			z(100),
		])
		bg.hidden = true
		txt.hidden = true
		return {
			say(t) {
				txt.text = t
				bg.hidden = false
				txt.hidden = false
			},
			dismiss() {
				if (!this.active()) {
					return
				}
				txt.text = ""
				bg.hidden = true
				txt.hidden = true
			},
			active() {
				return !bg.hidden
			},
			destroy() {
				bg.destroy()
				txt.destroy()
			},
		}
	}
	
	function addFlamebar(position = vec2(0), angle = 0, num = 6) {

	// Create a parent game object for position and rotation
	const flameHead = add([
		pos(position),
		rotate(angle),
	])

	// Add each section of flame as children
	for (let i = 0; i < num; i++) {
		flameHead.add([
			sprite("pineapple"),
			pos(0, i * 48),
			area(),
			anchor("center"),
			"flame",
		])
	}

	// The flame head's rotation will affect all its children
	flameHead.onUpdate(() => {
		flameHead.angle += dt() * 60
	})

	return flameHead

}

	addFlamebar(vec2(200, 300), -60)
	
	let hasKey = false
	const dialog = addDialog()

	player.onCollide("key", (key) => {
		destroy(key)
		hasKey = true
	})

	player.onCollide("door", () => {
		if (hasKey) {
			if (levelIdx + 1 < levels.length) {
				go("main", levelIdx + 1)
			} else {
				go("win")
			}
		} else {
			dialog.say("Wheres your keys?!")
		}
	})

	// talk on touch
	player.onCollide("character", (ch) => {
		dialog.say(ch.msg)
	})

	const dirs = {
		"left": LEFT,
		"right": RIGHT,
		"up": UP,
		"down": DOWN,
	}

	for (const dir in dirs) {
		onKeyPress(dir, () => {
			dialog.dismiss()
		})
		onKeyDown(dir, () => {
			player.move(dirs[dir].scale(SPEED))
		})
	}

})

scene("win", () => {
	add([
		text("You Survived!"),
		pos(width() / 2, height() / 2),
		anchor("center"),
	])
})

go("main", 0)
