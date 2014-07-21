//generate things onload---
var monsterDB = [];
function start() {
	generateMultiplier('m_l1',lm);
	generateMultiplier('m_l2',lm);
	generateMultiplier('m_other',om);
	generateOrbInput();
	generateSetAll('setall');
	generateSetAll('setall_c');
	monsterDB = JSON.parse(readMonsterDatabase());
	document.getElementById('isReady').style.display = 'none';
	//console.log(monsterDB);
	//insert other functions here
	changeStat('mon1',1422);
	changeStat('mon2',1217);
	changeStat('mon3',892);
	changeStat('mon4',1238);
	changeStat('mon5',1299);
	changeStat('mon6',1422);

}
//-------------------------

//global variables---------
var lm = [1, 1.25, 1.35, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7]; //leader multiplier
var om = [1, 1.5, 2, 2.5, 3]; //other multiplier
var monster_loc = ['unused',0,0,0,0,0,0]; //monster loc
var monster_s = {
	1:{atk:0,rh:[],tp:0,e1:0,e2:0},
	2:{atk:0,rh:[],tp:0,e1:0,e2:0},
	3:{atk:0,rh:[],tp:0,e1:0,e2:0},
	4:{atk:0,rh:[],tp:0,e1:0,e2:0},
	5:{atk:0,rh:[],tp:0,e1:0,e2:0},
	6:{atk:0,rh:[],tp:0,e1:0,e2:0},
};
var orb_input_total = 4;
var orb_s = {};
var orb_sc = {};

var combo = comboMul = 0;
var comboc = combocMul = 0;
var rh_count = rh_countc = [0,0,0,0,0];
var orb_base_dmg = orb_base_dmgc = ['unused',0,0,0,0,0,0]; // main atr & compare
var orb_base_dmg_sub = orb_base_dmg_subc = ['unused',0,0,0,0,0,0]; // sub atr & comapre

var damage = damagec = ['unused',0,0,0,0,0,0];
var damage_sub = damage_subc = ['unused',0,0,0,0,0,0];

var total_damage = total_damagec = 0;
var total_damage_sub = total_damage_subc = 0;
//-------------------------

function generateMultiplier(id,array) {
	var x = document.getElementById(id);
	for (var i = 0; i < array.length; i++) {
		var y = document.createElement('option');
		y.value = y.text = array[i];
		x.add(y);
	}
}

function generateOrbInput() {
	if ( arguments[0] === undefined ) { var a = 1; b = orb_input_total; }
	else { var a = orb_input_total+1; b = orb_input_total+arguments[1]; orb_input_total += arguments[1];}	
	for (var k = 0; k <= 1; k++ ) {
		var id = (k==0)?'orbinput':'orbinput_c';
		var x = document.getElementById(id);
		for (var i = a; i <= b; i++ ) {
			var y = document.createElement('input');
			y.type = 'number';
			y.value = y.value;
			y.id = (id=='orbinput')?'orb'+i:'orb'+i+'c';
			y.min = 3;
			y.max = 30;
			y.className = 'orb-input';
			x.appendChild(y);
			for (j=0; j<5; j++) {
				var y = document.createElement('input');
				y.type = 'image';
				y.src = 'images/'+j+'.png';
				y.id = (id=='orbinput')?'orb'+i+'e'+j:'orb'+i+'e'+j+'c';
				y.value = 0;
				y.className = 'orb-ns';
				x.appendChild(y);
				y.setAttribute('onClick', 'selectElem(this.id)');
			}
		}
	}
}

function generateSetAll(id) {
	var x = document.getElementById(id);
	var z = id.charAt(7); //return '' if not compare
	for (var i = 0; i <= 4; i++) {
		var y = document.createElement('input');
		y.type = 'image';
		y.src = 'images\\'+i+'.png';
		y.height = '20';
		y.width = '20';
		x.appendChild(y);
		var a = (z=='c')?1:0;
		y.setAttribute('onClick','setAll('+i+','+a+')');
	}
}

function setAll(val,parm) {
	var z = (parm==1)?'c':'';
	for (var i = 1; i <= orb_input_total; i++) {
		for (var j = 0; j <= 4; j++) {
			document.getElementById('orb'+i+'e'+j+z).value = (j==val)?1:0;
			document.getElementById('orb'+i+'e'+j+z).className = (j==val)?'orb-s':'orb-ns';
		}
	}
}


function calculateDamage() { 
	
	combo = 0;
	comboMul = 0;
	comboc = 0;
	combocMul = 0;

	rh_count = [0,0,0,0,0]; //row enhance matched count
	rh_countc = [0,0,0,0,0];
	re = [0,0,0,0,0]; //row enhance awoken count
	
	getMonsterStats(); //monster_s = sub1:{atk:0,rh:[],tp:0,e1:0,e2:0}
	getOrbInput(0); //orb_s = {element:[orb1,orb2...],element2:[orb1,orb2...]}
	getOrbInput(1); //orb_sc
	getCombo();
	getRowEnhance();
	
	//calculate damage
	damage = ['unused',0,0,0,0,0,0];
	damage_sub = ['unused',0,0,0,0,0,0];
	orb_base_dmg = ['unused',0,0,0,0,0,0];
	orb_base_dmgc = ['unused',0,0,0,0,0,0];
	orb_base_dmg_sub = ['unused',0,0,0,0,0,0];	
	orb_base_dmg_subc = ['unused',0,0,0,0,0,0];
	
	//orb input 1
	for (var i = 1; i <= 6; i ++) { // i = sub
		var e = monster_s[i]['e1'];
		var e_sub = monster_s[i]['e2'];
		for (var j = 0; j <= 4; j++ ) { // j = element
			if ( e == j ) {	// main element
				for (var k = 0; k < orb_s[j].length; k++ ) {
					var o = Number(orb_s[j][k]);
					orb_base_dmg[i] += ((o==4)?orbdmg(o)*tp(i):orbdmg(o))*isPlus(o);
				}
				orb_base_dmg[i] *= (rh_count[j]==0)?1:1+(rh_count[j]*0.1)*re[j];
			}
			if ( e_sub == j ) { // sub element
				var r = 0;
				for (var k = 0; k < orb_s[j].length; k++ ) {
					var o = Number(orb_s[j][k]);
					orb_base_dmg_sub[i] += ((o==4)?orbdmg(o)*tp(i):orbdmg(o))*isPlus(o)*((e_sub==e)?0.1:0.3);
				}
				orb_base_dmg_sub[i] *= (rh_count[j]==0)?1:1+(rh_count[j]*0.1)*re[j];
			}
		}

		// calculate damage of each sub here
		damage[i] = Math.round(orb_base_dmg[i]*atk(i)*leadMul()*comboMul); // and other multiplier
		damage_sub[i] = Math.round(orb_base_dmg_sub[i]*atk(i)*leadMul()*comboMul); 
	}
	
	//orb input 2
	for (var i = 1; i <= 6; i ++) { // i = sub
		var e = monster_s[i]['e1'];
		var e_sub = monster_s[i]['e2'];
		for (var j = 0; j <= 4; j++ ) { // j = element
			if ( e == j ) {	// main element
				for (var k = 0; k < orb_sc[j].length; k++ ) {
					var o = Number(orb_sc[j][k]);
					orb_base_dmgc[i] += ((o==4)?orbdmg(o)*tp(i):orbdmg(o))*isPlus(o);
				}
				orb_base_dmgc[i] *= (rh_countc[j]==0)?1:1+(rh_countc[j]*0.1)*re[j];
			}
			if ( e_sub == j ) { // sub element
				var r = 0;
				for (var k = 0; k < orb_sc[j].length; k++ ) {
					var o = Number(orb_sc[j][k]);
					orb_base_dmg_subc[i] += ((o==4)?orbdmg(o)*tp(i):orbdmg(o))*isPlus(o)*((e_sub==e)?0.1:0.3);
				}
				orb_base_dmg_subc[i] *= (rh_countc[j]==0)?1:1+(rh_countc[j]*0.1)*re[j];
			}
		}

		// calculate damage of each sub here
		damagec[i] = Math.round(orb_base_dmgc[i]*atk(i)*leadMul()*combocMul); // and other multiplier
		damage_subc[i] = Math.round(orb_base_dmg_subc[i]*atk(i)*leadMul()*combocMul); 
	}
				
	
	//display damage
	total_damage = 0;
	total_damage_sub = 0;
	total_damagec = 0;
	total_damage_subc = 0;
	for (var i = 1; i <= 6; i++) {
		var x = document.getElementById('damage'+i);
		var y = document.getElementById('damage'+i+'sub');
		var xc = document.getElementById('damage'+i+'c');
		var yc = document.getElementById('damage'+i+'subc');
		
		if ( combo != 0 ) {
			x.innerHTML = damage[i]; formatDamage(x,damage[i]);
			y.innerHTML = damage_sub[i]; formatDamage(y,damage_sub[i]);
			total_damage += damage[i]; total_damage += damage_sub[i];
		}
		if ( comboc != 0 ) {
			xc.innerHTML = damagec[i]; formatDamage(xc,damagec[i]);
			yc.innerHTML = damage_subc[i]; formatDamage(yc,damage_subc[i]);
			total_damagec += damagec[i]; total_damagec += damage_subc[i];				
		}
	}
	
	if ( combo != 0 ) {
		document.getElementById('result').style.display = 'table';
		var lp = '<p>';
		for (var j = 0; j <= 4; j++) { //j = element
			var z = 0;
			for (var i = 1; i <= 6; i++ ) {
				if (monster_s[i]['e1'] == j) { z += damage[i]; }
				if (monster_s[i]['e2'] == j) { z += damage_sub[i]; }
			}
			lp += '<img src="images/'+j+'.png" width="12" height="12">'+z;
			lp += (j==4)?'':'+ ';
		}
		lp += '</p>';
		document.getElementById('totaldamage').innerHTML = total_damage;
		document.getElementById('splitdamage').innerHTML = lp;
		document.getElementById('resultsummary').innerHTML = 'Total combo: '+combo+', Combo Multiplier: '+comboMul;
	} else { document.getElementById('result').style.display = 'none'; }
	
	if ( comboc != 0 ) {
		document.getElementById('resultc').style.display = 'table';
		var lpc = '<p>';
		for (var j = 0; j <= 4; j++) { //j = element
			var z = 0;
			for (var i = 1; i <= 6; i++ ) {
				if (monster_s[i]['e1'] == j) { z += damagec[i]; }
				if (monster_s[i]['e2'] == j) { z += damage_subc[i]; }
			}
			lpc += '<img src="images/'+j+'.png" width="12" height="12">'+z;
			lpc += (j==4)?'':'+ ';
		}
		lpc += '</p>';
		document.getElementById('totaldamagec').innerHTML = total_damagec;
		document.getElementById('splitdamagec').innerHTML = lpc;
		document.getElementById('resultsummaryc').innerHTML = 'Total combo: '+comboc+', Combo Multiplier: '+combocMul;
	} else { document.getElementById('resultc').style.display = 'none'; }

	//document.getElementById('disp').innerHTML = 'Total combo: ' + combo + ' Combo Multiplier: ' + comboMul + ', Row Multiplier: ' + rowMul + ', Leader Multiplier: ' + leadMul();
}

function formatDamage(x,val) {
	x.removeAttribute('style');
	if (val > 300000) { x.style.color = 'blue'; }
	if (val > 600000) { x.style.color = 'blue'; x.style.fontWeight = '900'; }
}

//get values
function getMonsterStats() { // sub1:{atk:0,rh:[],tp:0,e1:0,e2:0}
	for (i = 1; i <= 6 ; i++) {
		var x = monster_s[i];
		x.atk = document.getElementById('atk'+i).value;
		for (j = 0; j <= 4 ; j++) { //01234 
			x.rh[j] = countAwoken(monster_loc[i],j+22)
		}
		x.tp = document.getElementById('tp'+i).value;
		x.e1 = monsterDB[monster_loc[i]]['element'];
		x.e2 = monsterDB[monster_loc[i]]['element2'];
	}
}

function getOrbInput(val) { // orb_s = {element:[orb1,orb2...],element2:[orb1,orb2...]}
	for (var j = 0; j <= 4; j++) { // j = element
		var array = [];
		for (var i = 1; i <= orb_input_total; i++) {
			if (val == 0) {
				var x = document.getElementById('orb'+i).value;
				var y = document.getElementById('orb'+i+'e'+j).value;
				var z = orb_s;
				if (x>=6 && y==1) { rh_count[j]++; }
			}
			else if (val == 1) {
				var x = document.getElementById('orb'+i+'c').value;
				var y = document.getElementById('orb'+i+'e'+j+'c').value;		
				var z = orb_sc;
				if (x>=6 && y==1) { rh_countc[j]++; }
			}
			if (x>=3 && y==1) {	array.push(x); }
			z[j] = array;
		}
	}
}			
	
function getCombo() {
	for (var i = 0; i <= 4 ; i++) {
		combo += orb_s[i].length;
		comboc += orb_sc[i].length;
	}
	comboMul = (combo>1)?1+(combo-1)*0.25:1;
	combocMul = (comboc>1)?1+(comboc-1)*0.25:1;
}

function getRowEnhance () {
	for (var i = 1; i <= 6; i++ ) {
		for (var j = 0; j <= 4; j++ ) {
			re[j] += monster_s[i].rh[j];
		}
	}
}

function atk(mId) { //get attack of monster mId
	var x = 'atk' + mId;
	return Number(document.getElementById(x).value);
}

function tp(mId) { //return two-pronged multiplier
	var x = 'tp' + mId;
	var y = document.getElementById(x);
	var z = y.options[y.selectedIndex].value;
	return Number(z==0?1:(z==1?1.5:(z==2?2.25:0)));
}

function leadMul() { //get lead multipliers
	var x1 = document.getElementById('m_l1');
	var x2 = document.getElementById('m_l2');
	return Number(x1.options[x1.selectedIndex].value * x2.options[x2.selectedIndex].value);
}
 
function orbdmg(val) { //translate orb number to dmg
	if (val == 0 || val == 'NaN') { return 0; }
	else { return val == 3 ? 1 : (1+ (val-3)*0.25); }
}

function isPlus(orb_num) {
	var x = document.getElementById('isplus').options[document.getElementById('isplus').selectedIndex].value;
	return x==1?(Number(1+(orb_num*0.06))):1;
}

//generate options

function selectElem(id) {
	var x = document.getElementById(id);
	var pos = id.substr(id.indexOf('b')+1,(id.indexOf('e')-id.indexOf('b')-1));
	var pos_c = (id.charAt(id.length-1)=='c'?'c':'');//return "" if not compare
	for (i = 0; i < 5; i++) {
		document.getElementById('orb'+pos+'e'+i+pos_c).className = 'orb-ns';
		document.getElementById('orb'+pos+'e'+i+pos_c).value = 0;
	}	
	x.className='orb-s';
	x.value = 1;
}

//display stuff
function showCompare(checked) {
	var x = document.getElementById('table_c');
	var y = x.style.display;
	if (y == 'none' && checked) { x.style.display = 'block'; }
	else if (y == 'block') { x.style.display = 'none'; } 
}

function changeStat(id,val) {
	if (isNaN(val-0)) { console.log('Please enter valid monster id'); }
	else {
		var pos = id.charAt(id.length-1);
		var loc = getMonsterArrayLocation(Number(val));
		monster_loc[pos] = loc; 
		monsterDB[loc]['awoken_skills'].sort();
		
		//name
		var icon_size = 50;
		document.getElementById('name'+pos).innerHTML = '<a href="http://puzzledragonx.com/en/monster.asp?n='+val+'" target="_blank"><img src="http://puzzledragonx.com/en/img/book/'+val+'.png" height="'+icon_size+'" width="'+icon_size+'"></a>';
		document.getElementById('name'+pos).style.display = 'block';
		
		//atk up: 2
		document.getElementById('ismp'+pos).checked = false;
		var a = monsterDB[loc]['atk_max'] + countAwoken(loc,2)*100;
		document.getElementById('atk'+pos).value = a;
		updateSubAtk(pos);
		
		//row enhance: 22-26
		//problem: only getting the highest amount of row enhance #
		var r = 0;
		for (var i = 22; i <= 26; i++) {
			(countAwoken(loc,i)>r)?r=countAwoken(loc,i):r+=0;
		}
		document.getElementById('row'+pos).selectedIndex = r;

		//two prongeed: 27
		document.getElementById('tp'+pos).selectedIndex = countAwoken(loc,27);
	}
}

function updateSubAtk(pos) { //update sub attack
	var a = document.getElementById('atk'+pos).value;
	var b = monster_loc[pos];
	var y = monsterDB[b]['element2'];
	var z = 0;
	if (y == null) { }
	else {
		var x = monsterDB[b]['element'];
		(x==y)?z=Math.floor(a*0.1):z=Math.floor(a*0.3);
	}
	document.getElementById('atk'+pos+'s').value = z;
}

//add 495 atk for 297 check
var old_atk = [0,0,0,0,0,0]; //store old atk

function is297(id) {
	var x = id.charAt(id.length-1);
	var y = Number(document.getElementById('atk'+x).value);
	if (document.getElementById(id).checked) {
		old_atk[x] = y;
		y += 495;
		document.getElementById('atk'+x).value = y;
	}
	else { 
		var j = y;
		document.getElementById('atk'+x).value = old_atk[x];
		old_atk[x] = j;
	}
	updateSubAtk(x);
}

function change_m2(val) {
	var x = document.getElementById('m_l2');
	x.selectedIndex = val;
}

//read mosnters database
function readMonsterDatabase() {
	return document.getElementById('monsterDB').contentDocument.body.firstChild.innerHTML;
}

function getMonsterArrayLocation(id) {
	for (var i = 0; i < monsterDB.length; i++) {
		if ( monsterDB[i]['id'] == id) { return i; }
	}
	return 9999;
}

function countAwoken(arrId,val) {
	if (arrId == 9999) { return 0; }
	var x = monsterDB[arrId]['awoken_skills'].lastIndexOf(val);
	if ( x >= 0 ) {
		x = x - Number(monsterDB[arrId]['awoken_skills'].indexOf(val))+1;
	}
	else { x = 0; }
	return x;
}