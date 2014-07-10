//generate things onload---
var monsterDB = [];
function start() {
	generateMultiplier('m_l1',lm);
	generateMultiplier('m_l2',lm);
	generateMultiplier('m_other',om);
	generateOrbInput('orbinput');
	generateOrbInput('orbinput_c');
	monsterDB = JSON.parse(readMonsterDatabase());
	document.getElementById('isReady').style.display = 'none';
	//console.log(monsterDB);
	//insert other functions here
}
//-------------------------

function getInput() {
	var array = [];
	array[0] = 0;
	for (var i = 1; i <= 6 ; i++) {
		array[i] = atk(i);
	}
	return array;
}

function precd() {
	var orbx = [0,0,0,0,0,0];
	
	if (document.getElementById('isCompare').checked) {
		for (var i = 0; i < 5 ; i++) {
			orbx[i] = orbc(i+1);
		}
		orbx[5] = Number(document.getElementById('other_combo_c').value);
		calculateDamage(orbx,1);
	}
	
	for (var i = 0; i < 5 ; i++) { //get orb config into orb[]
		orbx[i] = orb(i+1);
	}
	orbx[5] = Number(document.getElementById('other_combo').value);
	calculateDamage(orbx);
}
	
function calculateDamage(orbx) { //modify to get orb config
	
	var rowCount = combo = comboMul = 0;
	
	//calculate damage
	var orb_base_damage = [0,0,0,0,0,0];
	for (var j = 0; j < 6; j++) { //loop subs
		for (var i = 1; i <= 5; i++) { //loop orbs matched
			var x = orbx[i-1];
			var y = 1;
			if ( j == 0 ) {
				if ( x >= 3 ) { combo++; } //add combo count if orb > 3
				if ( x >= 6 ) { rowCount++; } //add row count if orb > 6
			}
			if ( x == 4 ) { y = tp(j+1); } //two-pronged if orb = 4
			orb_base_damage[j] += orbdmg(x) * isPlus(i) * y; //calculate base damage from orbs		
		}
	}
	combo += orbx[5];
	comboMul = combo==1?1:(1+(0.25*(combo-1)));
	var rowMul = 1 + Number(rh()*rowCount/10);
	
	var dmg = []; //store damage of each sub
	for (var j = 0; j < 6; j++) {
		dmg[j] = Number(orb_base_damage[j] * comboMul * atk(j+1) * rowMul * leadMul());
	}
	
	
	//display damage
	var totaldmg = 0;
	
	//change things for compare
	if ( arguments[1] == 1 ) { 
		for (var i = 0; i <= 5; i++) {
			x = 'damage' + Number(i+1) + '-compare';
			y = Math.round(dmg[i]);
			document.getElementById(x).innerHTML = y;
			document.getElementById(x).removeAttribute('style');
			if (y > 300000) { document.getElementById(x).style.color = 'blue'; }
			if (y > 600000) { document.getElementById(x).style.fontWeight = '900'; }
			totaldmg += y;
		}
		document.getElementById('totaldamage-compare').innerHTML = totaldmg;	
		document.getElementById('disp-compare').innerHTML = 'Total combo: ' + combo + ' Combo Multiplier: ' + comboMul + ', Row Multiplier: ' + rowMul + ', Leader Multiplier: ' + leadMul();
		document.getElementById('result_compare').style.display = 'table';
	}
	
	//normal things
	else {
		for (var i = 0; i <= 5; i++) {
			x = 'damage' + Number(i+1);
			y = Math.round(dmg[i]);
			document.getElementById(x).innerHTML = y;
			document.getElementById(x).removeAttribute('style');
			if (y > 300000) { document.getElementById(x).style.color = 'blue'; }
			if (y > 600000) { document.getElementById(x).style.fontWeight = '900'; }
			totaldmg += y;
		}
		document.getElementById('totaldamage').innerHTML = totaldmg;	
		document.getElementById('disp').innerHTML = 'Total combo: ' + combo + ' Combo Multiplier: ' + comboMul + ', Row Multiplier: ' + rowMul + ', Leader Multiplier: ' + leadMul();
		document.getElementById('result').style.display = 'table';
	}
}

//get values
function atk(mId) { //get attack of monster mId
	var x = 'atk' + mId;
	return Number(document.getElementById(x).value);
}

function rh() { //return total number of row enhance
	var x, y;
	var r = 0;
	for (var i = 0; i <= 5; i++) {
		x = 'row' + Number(i+1);
		y = document.getElementById(x);
		r += Number(y.options[y.selectedIndex].value);
	}
	return r;
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

function orb(mId) { //get orb input
	var x = 'orb' + mId;
	var y = document.getElementById(x).value;
	return y>=3?Number(y):0;
}

function orbc(mId) { //get orb input (compare)
	var x = 'orb' + mId + 'c';
	var y = document.getElementById(x).value;
	return y>=3?Number(y):0;
}
 
function orbdmg(val) { //translate orb number to dmg
	if (val == 0 || val == 'NaN') { return 0; }
	else { return val == 3 ? 1 : (1+ (val-3)*0.25); }
}

function isPlus(mId) {
	var x = document.getElementById('isplus').options[document.getElementById('isplus').selectedIndex].value;
	return x==1?(Number(1+orb(mId)*0.06)):1;
}

//generate options
var lm = [1, 1.25, 1.35, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7];
var om = [1, 1.5, 2, 2.5, 3];

function generateMultiplier(id,array) {
	var x = document.getElementById(id);
	for (var i = 0; i < array.length; i++) {
		var y = document.createElement('option');
		y.value = y.text = array[i];
		x.add(y);
	}
}

function generateOrbInput(id) {
	var x = document.getElementById(id);
	var count = 1;
	for (var i = 1; i <= 5; i++ ) {
		var y = document.createElement('input');
		y.setAttribute('type','number');
		id=='orbinput'?(y.setAttribute('id', 'orb' + i)):(y.setAttribute('id', 'orb' + i + 'c'));
		y.setAttribute('onblur', 'checkOrbInput(this.value)');
		y.setAttribute('min','3');
		y.setAttribute('max','30');
		y.setAttribute('class','orb-input');
		if (count == 1) { y.setAttribute('value','3') } ;
		count=0;
		x.appendChild(y);
	}
}

function checkOrbInput(val) {
	if ((val > 30 || val < 3) && (val != 0)) {
		//handle error here 
	}
}

//display stuff
function showCompare(checked) {
	var x = document.getElementById('table_c');
	var y = x.style.display;
	if (y == 'none' && checked) { x.style.display = 'block'; }
	else if (y == 'block') { x.style.display = 'none'; } 
}

function changeStat(id,val) {
	if (isNaN(val-0)) { console.log('Please enter valid monster id') }
	else {
		var pos = id.charAt(id.length-1);
		var loc = getMonsterArrayLocation(Number(val));
		monsterDB[loc]['awoken_skills'].sort();
		
		//atk up: 2
		document.getElementById('ismp'+pos).checked = false;
		document.getElementById('atk'+pos).value = monsterDB[loc]['atk_max'] + countAwoken(loc,2)*100;
		
		//row enhance: 22-26
		//problem: only getting the highest amount of row enhance #
		var r = 0;
		for (var i = 22; i < 26; i++) {
			(countAwoken(loc,i)>r)?r=countAwoken(loc,i):r+=0;
		}
		document.getElementById('row'+pos).selectedIndex = r;

		//two prongeed: 27
		document.getElementById('tp'+pos).selectedIndex = countAwoken(loc,27);
	}
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
}

function countAwoken(arrId,val) {
	var x = monsterDB[arrId]['awoken_skills'].lastIndexOf(val);
	if ( x >= 0 ) {
		x = x - Number(monsterDB[arrId]['awoken_skills'].indexOf(val))+1;
	}
	else { x = 0; }
	return x;
}