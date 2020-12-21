'use strict';

import pg from 'pg';
const { Pool } = pg;
const pool = new Pool();

export default {
    async getDataFromDB() {
        // select * from tokens where id in (4,1,6,2,3);	
        let res = await pool.query('select units.id, units.pid from units left join phrases on units.pid=phrases.pid limit 5');
        const data = res.rows;
        // console.log(JSON.stringify(data));
        res = await pool.query("select * from tokens");
        const dict = res.rows.reduce((obj, item) => (obj[item.id.toString()] = item.token, obj), {});
        res = await pool.query("select pid, phrase->0 as phrase from phrases");
        const phrases = res.rows;
        const index = res.rows.reduce((obj, item) => (obj[item.pid.toString()] = item.phrase, obj), {});
        // console.log(index);
        // .join(" ").replace(/ (?=-)/, '')
        const phraseMap = phrases.map(x => ({
            "pid": x["pid"],
            "phrase": x["phrase"].map(y => dict[y]).join(" ").replace(/ (?=-)/, '')
        }));

        // for (let i = 0; i < phrases.length; i++) {
            // const entry = phrases[i];
            // console.log(entry["id"]);
            // const phrase = index[entry["pid"]];
            // for (let x=0; x<phrase.length; x++){
            // console.log("!", phrase[x]);

            // }
            // console.log("!",entry);
            // const phraseMap  = phrase.map(x => dict[x]).join(" ").replace(/ (?=-)/, '');
            // console.log(entry["pid"], phraseMap);
        // }

        // pool.end();
        return phraseMap;
    },
	async getPhrases(){
		const res = await pool.query(' select * from phrases');
        return res.rows;
	}, 
	async getIndex(){
		const res = await pool.query('select units.id, units.pid, phrase->0 as eid1 from units inner join phrases on units.pid=phrases.pid');
        return res.rows;
	}, 
	async getFeatures(){
		const res = await pool.query('select id, ru FROM features');
        return Object.fromEntries(res.rows.map(item => [item.id, item.ru]));
	}, 
	async getUnits(pid){
		const units = await pool.query('select * FROM units where pid=$1', [pid]);
		const phrases = await pool.query('select * FROM phrases where pid=$1', [pid]);
        return { "units": units.rows, "phrase": phrases.rows[0]["phrase"]};
	},
	async getExprs(){
		const res = await pool.query('select * from exprs');
		const data = res.rows;
        // return data;
		
		
		const dict = data.reduce((obj, item) => (obj[item.eid.toString()] = item.expr, obj), {});
		return dict;
		
		// const dict = {"keys":[],"values":[]};
		// for (let i=0; i<data.length; i++){
			// dict.keys.push(data[i].eid);
			// dict.values.push(data[i].expr);
		// }
		// return dict;
	},
	async getTokens() {		
		const res = await pool.query("select * from tokens");
		
		const data = res.rows;
		const dict = {"keys":[],"values":[]};
		for (let i=0; i<data.length; i++){
			dict.keys.push(data[i].id);
			dict.values.push(data[i].token);
		}
		// console.log(dict);
		return dict;
	}
};