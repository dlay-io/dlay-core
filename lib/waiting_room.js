module.exports = {
	waiters:{},
	clear:function(){
		this.waiter = {};
	},
	allByDate:function(date, callback){
		var __self = this;
		var all = [];
		for(var i in this.waiters){
			var waiter = this.waiters[i];
			waiter.id = i;
			if(waiter.date === date){
				all.push(waiter);
			}
		}
		if(callback){ callback(all);}
		
		return {
			each:function(fn){
				for(var i = 0; i < all.length; i++){
					var id = all[i].id;
					fn(__self.waiters[id]);
				}
				return this;
			},
			destroy:function(){
				for(var i = 0; i < all.length; i++){
					var id = all[i].id;
					delete __self.waiters[id];
				}
				return __self.waiters;
			}
		};
	},
	put:function(id,data){
		if(typeof data === "object"){
			this.waiters[id] = data;
			return data;
		}
		else{
			throw "only objects acnbe saved";
		}
	},
	get:function(id){
		return this.waiters[id];
	},
	remove:function(id){
		delete this.waiters[id];
		return this.waiters;
	}
};