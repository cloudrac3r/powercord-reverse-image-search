const {Plugin} = require("powercord/entities")
const webpack = require("powercord/webpack")
const {getModuleByDisplayName, getModule, React} = webpack
const {ContextMenu: {Button, Submenu}} = require("powercord/components")
const util = require("powercord/util")
const {getOwnerInstance} = util
const {inject, uninject} = require("powercord/injector")

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
	["Karma Decay (reddit)", "http://karmadecay.com/?url=%%"],
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
								if (p[2] === false) url = target.src
								else url = encodeURIComponent(target.src)
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
	}

	pluginWillUnload() {
		uninject("reverse-image-search-messageContext")
		uninject("reverse-image-search-nativeContext")
	}
}
