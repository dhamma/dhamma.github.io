var providentpali = (function (exports) {
    'use strict';

    const romanized_charset=/([aāiīuūenoṃcvkbdtphḍṭñṅṇsjgymrlḷ]+)/i;
    const syllablify=str=>{
        str=str.toLowerCase();
        const words=str.split(romanized_charset);
        return words.map(w=>{
               const syl=[];
                let prev=0;
                if (!w.trim()) {
                    syl.push(w);
                    return syl;
                }     
                w.replace(/([cvkbdtphḍṭṇñṅsnjgymrlḷ]*[āaiīuūeo][ṃ]?)/gi,(m,m1,offset)=>{ 
                    if (offset>0 && offset>prev) syl.push(w.substr(prev,offset));
                    syl.push(m1);
                    prev=offset+m.length;
                });
                if (prev<w.length) syl.push( w.substr(prev));
                return syl;
            }
        )
        
    };

    const isRomanized=str=>{
        return (!!str.match(romanized_charset));
    };

    const Vowels={
        '':'',
    'a':'','ā':'A','i':'I','ī':'II','u':'U','ū':'UU','e':'E','o':'O'
    };
    const beginVowels={
        'a':'a','ā':'aA','i':'i','ī':'iI','u':'u','ū':'uU','o':'o','e':'e',
    };
    const i2p={
        'k':'k','t':'t','ñ':'Y','ṅ':'N','ṇ':'N','ḍ':'F','ṭ':'V','p':'p','c':'c','j':'j',
        's':'s','b':'b','y':'y','g':'g','d':'d','h':'h','m':'m','l':'l','v':'v','r':'r','n':'n',
        'kh':'K', 'gh':'G', 'jh':'J', 'ch':'C' ,'ṭh':'W', 'ḍh':'Q', 'th':'T', 'dh':'D', 'ph':'P', 'bh':'B',
        'kk':'kXk', 'kkh':'kXK',    'gg':'gXg', 'ggh':'gXG',
        'tt':'tXT', 'tth':'tXT',    'ṭṭ':'VXV', 'ṭṭh':'VXW',
        'pp':'pXp', 'pph':'pXP',    'bb':'bXb', 'bbh':'bXB',
        'jj':'jXj', 'jjh':'jXJ',    'cc':'cXc', 'cch':'cXC',
        'll':'lXl', 'mm':'mXm',     'nn':'nXn', 'ññ':'YXY',
        'dd':'dXd', 'ddh':'dXD',    'ḍḍ':'FXF', 'ḍḍh':'FXQ',
        'ss':'sXs', 'yy':'yXy',     

        'ṅgh':'NXG','ṅg':'NXg','ṅkh':'NXK','ṅk':'NXk', 'ṅkhy':'NXKXy',
        'dr':'dXr','dv':'dXv','ndr':'nXdXr',

        'br':'bXr',    'khv':'KXv',    'hm':'hXm',    'ly':'lXy',
        'mbh':'mXB','mh':'mXh','mp':'mXp','mb':'mXb',
        'nd':'nXd','ndh':'nXD','ṇṭh':'NXW',
        'ñc':'YXc','ñj':'YXj','ñjh':'YXJ',
        'ṇṭ':'NXV','nt':'nXt','ṇḍ':'NXF',
        'sv':'sXv','sm':'sXm',
        'tv':'tXv',

        //not in font ligature
        'ḷh':'LXh',
        'nth':'nXT',
        'yh':'yXh',
        'ly':'lXy',
        'tr':'tXr',
        'mph':'mXP',
        'nh':'nXh',
        'ñch':'YXC',
        'vh':'vXh',
        'ṇṭ':'NXV',
        'nv':'nXv',
        'ky':'kXy',
        'gy':'gXy',
        'ntv':'nXtXv',
        'my':'mXy',
        'ty':'tXy',
        'gr':'gXr',
        'kr':'kXr',
        'sn':'sXn',
        'kl':'kXl',
        'st':'sXt',
        'khy':'KXy',
        'pl':'pXl',
        'nty':'nXtXy',
        'hv':'hXv',
        'sy':'sXy',
        'dm':'dXm',
        'khv':'KXv',
        'ṇy':'NXy',
        'kv':'kXv'
    };
    const p2i={};
    for (let key in i2p) p2i[i2p[key]]=key;
    for (let key in beginVowels) p2i[beginVowels[key]]=key;

    const convertSyllable=(syl,begin)=>{
        let out='';
        if (isRomanized(syl)) {
            let m=syl.match(/^([kgṅcjñṭḍṇtdnpbylḷhsmrv]*)([aāiīuūeo])(ṃ?)$/);
            if (m) {
                const [m0,c,v,niggatha] = m;
                const co = i2p[c]||'';
                if (co) {
                    out+=co+Vowels[v]+(niggatha?'M':'');
                } else {
                    out+=beginVowels[v]+(niggatha?'M':'');
                }
            } else {
                return '!'+syl;
            }
        } else {
            return syl;
        }
        return out;
    };


    const fromIAST=(input,opts={})=>{
        const parts=(opts.format==='xml')?input.split(/(<[^<]+>)/):[input];
        let out='';
        for (let j=0;j<parts.length;j++) {
            if (parts[j][0]=='<') {
                out+=parts[j];
                continue;
            }
            const str=parts[j].replace(/ṁ/ig,'ṃ');
            const words=syllablify(str);
            let s='';
            for (let i=0;i<words.length;i++) {
                for (let j=0;j<words[i].length;j++) {
                    const r=convertSyllable(words[i][j]);
                    if (r[0]=='!') return s+r;
                    else s+=r;
                }
            }
            out+=s;
        }
        return out;
    };

    const toIAST=(str,opts={})=>{
        let out='';
        const convert=p=>{
            let ch='',out='',i=0;
            ch=p[0];
            const leadv='aeiou'.indexOf(ch);
            if (leadv>-1) {
                if (p[0]=='a'&&p[1]=='A') {out+='ā';i++;}
                else if (p[0]=='i'&&p[1]=='I') {out+='ī';i++;}
                else if (p[0]=='u'&&p[1]=='U') {out+='ū';i++;}
                else out+=ch;
                i++;
                ch=p[i];
            } 
            let needvowel=false;
            while (i<p.length) {
                ch=p[i];
                if ('aeiou'.indexOf(ch)>-1) return out+'!'+p.substr(i);
                const v='MAEIOU'.indexOf(ch);
                if (v>-1) {
                    if (v==0&&needvowel) out+='a';
                    if (p[i+1]=='I') {i++;out+='ī';}
                    else if (p[i+1]=='U') {i++;out+='ū';}
                    else out+='ṃāeiou'[v];
                    i++; 
                    needvowel=false;
                }  else { 
                    let cons=p[i];
                    if (cons=='X') return out+'!1'+p.substr(i); //invalid
                    
                    while (i<p.length&& p[i+1]=='X') {
                        cons+='X'+p[i+2];
                        i+=2;
                    }
                    const c=p2i[cons];
                    if (!c) {
                        return out+'!2'+p.substr(i);
                    } else {
                        if (needvowel) out+='a';
                        out+=c;
                        needvowel=true;
                        i++;
                    }
                }
            }
            if (needvowel) out+='a';
            return out;
        };

        const parts=(opts.format==='xml')?str.split(/(<[^<]+>)/):[str];

        for (let j=0;j<parts.length;j++) {
            if (parts[j][0]=='<') {
                out+=parts[j];
                continue;
            }
            const units=parts[j].split(/([aeiouXBCDFGHJKLNPQRSTVWXYZbcdghjklmnprstuvyAEIOUM]+)/);
            units.forEach(s=>{
                const m=s.match(/[aeiouXBCDFGHJKLNPQRSTVWXYZbcdghjklmnprstuvyAEIOUM]/);
                if (!m) {
                    out+=s;
                } else {
                    out+=convert(s);    
                }
            });
        }

        return out;
    };

    exports.convertSyllable = convertSyllable;
    exports.fromIAST = fromIAST;
    exports.isRomanized = isRomanized;
    exports.syllablify = syllablify;
    exports.toIAST = toIAST;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
