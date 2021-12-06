var providentpali = (function (exports) {
    'use strict';

    const isRomanized=str=>{
        return (!!str.match(romanized_charset));
    };

    const romanized_charset=/([aāiīuūenoṃcvkbdtphḍṭñṅṇsjgymrlḷ]+)/i;
    const breakIASTSyllable=str=>{
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
    const Vowels={
        '':'',
    'a':'','ā':'A','i':'I','ī':'II','u':'U','ū':'UU','e':'E','o':'O'
    };
    const beginVowels={
        'a':'a','ā':'aA','i':'i','ī':'iI','u':'u','ū':'uU','o':'o','e':'e',
    };
    const i2p={
        'k':'k','t':'t','ñ':'Y','ṅ':'N','ṇ':'N','ḍ':'F','ṭ':'W','p':'p','c':'c','j':'j',
        's':'s','b':'b','y':'y','g':'g','d':'d','h':'h','m':'m','l':'l','v':'v','r':'r','n':'n',
        'kh':'K', 'gh':'G', 'jh':'J', 'ch':'C' ,'ṭh':'X', 'ḍh':'Q', 'th':'T', 'dh':'D', 'ph':'P', 'bh':'B',
        'kk':'kVk', 'kkh':'kVK',    'gg':'gVg', 'ggh':'gVG',
        'tt':'tVt', 'tth':'tVT',    'ṭṭ':'WVW', 'ṭṭh':'WVX',
        'pp':'pVp', 'pph':'pVP',    'bb':'bVb', 'bbh':'bVB',
        'jj':'jVj', 'jjh':'jVJ',    'cc':'cVc', 'cch':'cVC',
        'll':'lVl', 'mm':'mVm',     'nn':'nVn', 'ññ':'YVY',
        'dd':'dVd', 'ddh':'dVD',    'ḍḍ':'FVF', 'ḍḍh':'FVQ',
        'ss':'sVs', 'yy':'yVy',     'ṇṇ':'NVN', 

        'ṅgh':'NVG','ṅg':'NVg','ṅkh':'NVK','ṅk':'NVk', 'ṅkhy':'NVKVy',
        'dr':'dVr','dv':'dVv','ndr':'nVdVr',

        'br':'bVr',    'khv':'KVv',    'hm':'hVm',    'ly':'lVy',
        'mbh':'mVB','mh':'mVh','mp':'mVp','mb':'mVb',
        'nd':'nVd','ndh':'nVD','ṇṭh':'NVX',
        'ñc':'YVc','ñj':'YVj','ñjh':'YVJ',
        'ṇṭ':'NVV','nt':'nVt','ṇḍ':'NVF',
        'sv':'sVv','sm':'sVm',
        'tv':'tVv',

        //not in font ligature
        'ḷh':'LVh',
        'nth':'nVT',
        'yh':'yVh',
        'ly':'lVy',
        'tr':'tVr',
        'mph':'mVP',
        'nh':'nVh',
        'ñch':'YVC',
        'vh':'vVh',
        'ṇṭ':'NVW',
        'nv':'nVv',
        'ky':'kVy',
        'gy':'gVy',
        'ntv':'nVtVv',
        'my':'mVy',
        'ty':'tVy',
        'gr':'gVr',
        'kr':'kVr',
        'sn':'sVn',
        'kl':'kVl',
        'st':'sVt',
        'khy':'KVy',
        'pl':'pVl',
        'nty':'nVtVy',
        'hv':'hVv',
        'sy':'sVy',
        'dm':'dVm',
        'khv':'KVv',
        'ṇy':'NVy',
        'kv':'kVv'
    };
    const p2i={};
    for (let key in i2p) p2i[i2p[key]]=key;
    for (let key in beginVowels) p2i[beginVowels[key]]=key;

    const convertIASTSyllable=(syl,begin)=>{
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
            const words=breakIASTSyllable(str);
            let s='';
            for (let i=0;i<words.length;i++) {
                for (let j=0;j<words[i].length;j++) {
                    const r=convertIASTSyllable(words[i][j]);
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
                
                //allow sauddesaṁ
                //if ('aeiou'.indexOf(ch)>-1) return out+'!'+p.substr(i);

                const v='MAEIOU'.indexOf(ch);
                if (v>-1) {
                    if (v==0&&needvowel) out+='a';
                    if (p[i+1]=='I') {i++;out+='ī';}
                    else if (p[i+1]=='U') {i++;out+='ū';}
                    else out+='ṃāeiou'[v];
                    i++; 
                    needvowel=false;
                }  else { 
                    if (needvowel) out+='a';
                    let cons=p[i];
                    if (cons=='V') return out+'!1'+p.substr(i); //invalid
                    
                    while (i<p.length&& p[i+1]=='V') {
                        cons+='V'+p[i+2];
                        i+=2;
                    }
                    const c=p2i[cons];
                    if (!c) {
                        return out+'!2'+p.substr(i);
                    } else {
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
            const units=parts[j].split(/([a-zA-Z]+)/);
            units.forEach(s=>{
                const m=s.match(/[a-zA-Z]/);
                if (!m) {
                    out+=s;
                } else {
                    out+=convert(s);    
                }
            });
        }

        return out;
    };

    const devanagari={
        'क':'k','ख':'K','ग':'g', 'घ':'G','ङ':'N', 'ह':'h',
        'च':'c','छ':'C','ज':'j','झ':'J','ञ':'Y','य':'y','श':'Z',
        'ट':'W','ठ':'X','ड':'F','ढ':'Q','ण':'N','र':'r','ष':'S',
        'त':'t','थ':'T','द':'d','ध':'D','न':'n','ल':'l','स':'s',
        'प':'p','फ':'P','ब':'b','भ':'B','म':'m','व':'v','ळ':'L','ं':'M',
        '॰':'',//use only by pe...
        'अ':'a','इ':'i','उ':'u','ए':'e','ओ':'o','आ':'aA','ई':'iI','ऊ':'uU','ऐ':'ai','औ':'au',
        'ा':'A','ि':'I','ी':'II','ु':'U','ू':'UU','े':'E','ो':'O', 
        '्':'V', //virama , 連接下個輔音。
        '०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9',
        '।':'|','॥':'||',
        'ौ':'aU', //invalid in pali
        'ै' :'aI',//invalid in pali
        'ऋ':'R',
        'ः':'H'//visarga, rare
    };

    const sinhala={
       'ක':'k','ඛ':'K','ග':'g', 'ඝ':'G','ඞ':'N', 'හ':'h',
       'ච':'c','ඡ':'C','ජ':'j','ඣ':'J','ඤ':'Y','ය':'y','श':'Z',
       'ට':'W','ඨ':'X','ඩ':'F','ඪ':'Q','ණ':'N','ර':'r','ष':'S', 
       'ත':'t','ථ':'T','ද':'d','ධ':'D','න':'n','ල':'l','ස':'s', 
       'ප':'p','ඵ':'P','බ':'b','භ':'B','ම':'m','ව':'v','ළ':'L','ං':'M',
       'අ':'a','ඉ':'i','උ':'u','එ':'e','ඔ':'o','ආ':'aA','ඊ':'iI','ඌ':'uU',
       'ා':'A','ි':'I','ී':'II','ු':'U','ූ':'UU','ෙ':'E','ො':'O', 
       '්':'V'
    };

    const myanmar={
        'က':'k','ခ':'K','ဂ':'g', 'ဃ':'G','င':'N', 'ဟ':'h',
        'စ':'c','ဆ':'C','ဇ':'j','ဈ':'J','ဉ':'Y','ယ':'y','श':'Z',
        'ဋ':'W','ဌ':'X','ဍ':'F','ဎ':'Q','ဏ':'N','ရ':'r','ष':'S',
        'တ':'t','ထ':'T','ဒ':'d','ဓ':'D','န':'n','လ':'l','သ':'s',
        'ပ':'p','ဖ':'P','ဗ':'b','ဘ':'B','မ':'m','ဝ':'v','ဠ':'L','ံ':'M',
        'အ':'a','ဣ':'i','ဥ':'u','ဧ':'e','ဩ':'o','အာ':'aA','ဤ':'iI','ဦ':'uU',
        'ာ':'A','ိ':'I','ီ':'II','ု':'U','ူ':'UU','ေ':'E','ော':'O',
        '္':'V',
        '၀':'0','၁':'1','၂':'2','၃':'3','၄':'4','၅':'5','၆':'6','၇':'7','၈':'8','၉':'9',
    };
    const thai={
        'ก':'k','ข':'K','ค':'g', 'ฆ':'G','ง':'N', 'ห':'h', 
        'จ':'c','ฉ':'C','ช':'j','ฌ':'J','ญ':'Y','ย':'y','श':'Z',
        'ฏ':'W','ฐ':'X','ฑ':'F','ฒ':'Q','ณ':'N','ร':'r','ष':'S',
        'ต':'t','ถ':'T','ท':'d','ธ':'D','น':'n','ล':'l','ส':'s',
        'ป':'p','ผ':'P','พ':'b','ภ':'B','ม':'m','ว':'v','ฬ':'L','ํ':'M', 
        'อ':'a','อิ':'i','อุ':'u','เอ':'e','โอ':'o','อา':'aA','อี':'iI','อู':'uU',
        'า':'A','ิ':'I','ี':'II','ุ':'U','ู':'UU','เ':'E','โ':'O',
        'ฺ':'V',
        '๐':'0','๑':'1','๒':'2','๓':'3','๔':'4','๕':'5','๖':'6','๗':'7','๘':'8','๙':'9',
    };
    const khmer={

        'ក':'k','ខ':'K','គ':'g', 'ឃ':'G','ង':'N', 'ហ':'h',
       'ច':'c','ឆ':'C','ជ':'j','ឈ':'J','ញ':'Y','យ':'y','श':'Z',
       'ដ':'W','ឋ':'X','ឌ':'F','ឍ':'Q','ណ':'N','រ':'r','ष':'S',
       'ត':'t','ថ':'T','ទ':'d','ធ':'D','ន':'n','ល':'l','ស':'s',
       'ប':'p','ផ':'P','ព':'b','ភ':'B','ម':'m','វ':'v','ឡ':'L','ំ':'M',
       'អ':'a','ឥ':'i','ឧ':'u','ឯ':'e','ឱ':'o','អា':'aA','ឦ':'iI','ឩ':'uU',
       'ា':'A','ិ':'I','ី':'II','ុ':'U','ូ':'UU','េ':'E','ោ':'O',
          '្':'V',
          '០':'0','១':'1','២':'2','៣':'3','៤':'4','៥':'5','៦':'6','៧':'7','៨':'8','៩':'9',
    };
    const lao={
        'ກ':'k','ຂ':'K','ຄ':'g', 'ຆ':'G','ງ':'N', 'ຫ':'h',
        'ຈ':'c','ຉ':'C','ຊ':'j','ຌ':'J','ຎ':'Y','ຍ':'y','श':'Z',
        'ຏ':'W','ຐ':'X','ຑ':'F','ຒ':'Q','ຓ':'N','ຣ':'r','ष':'S',
        'ຕ':'t','ຖ':'T','ທ':'d','ຘ':'D','ນ':'n','ລ':'l','ສ':'s',
        'ປ':'p','ຜ':'P','ພ':'b','ຠ':'B','ມ':'m','ວ':'v','ຬ':'L','ໍ':'M',
        'ອ':'a','ອິ':'i','ອຸ':'u','ເອ':'e','ໂອ':'o','ອາ':'aA','ອີ':'iI','ອູ':'uU',
          'າ':'A','ິ':'I','ີ':'II','ຸ':'U','ູ':'UU','ເ':'E','ໂ':'O',
       '຺':'V',
         '໐':'0','໑':'1','໒':'2','໓':'3','໔':'4','໕':'5','໖':'6','໗':'7','໘':'8','໙':'9',
    };
    const tibetan={
        'ཀ':'k','ཁ':'K','ག':'g', 'གྷ':'G','ང':'N', 'ཧ':'h',
        'ཙ':'c','ཚ':'C','ཛ':'j','ཛྷ':'J','ཉ':'Y','ཡ':'y','श':'Z',
        'ཊ':'W','ཋ':'X','ཌ':'F','ཌྷ':'Q','ཎ':'N','ར':'r','ष':'S',
        'ཏ':'t','ཐ':'T','ད':'d','དྷ':'D','ན':'n','ལ':'l','ས':'s',
        'པ':'p','ཕ':'P','བ':'b','བྷ':'B','མ':'m','ཝ':'v','ལ༹':'L','ཾ':'M',
        'ཨ':'a','ཨི':'i','ཨུ':'u','ཨེ':'e','ཨོ':'o','ཨཱ':'aA','ཨཱི':'iI','ཨཱུ':'uU',
        'ཱ':'A','ི':'I','ཱི':'II','ུ':'U','ཱུ':'UU','ེ':'E','ོ':'O',
        '྄':'V', 
        '༠':'0','༡':'1','༢':'2','༣':'3','༤':'4','༥':'5','༦':'6','༧':'7','༨':'8','༩':'9',
    };
    // export const cyrillic={
    //     'к':'k','кх':'K','г':'g', 'гх':'G','н̇а':'N', 'х':'h', 
    //   'ч':'c','чх':'C','дж':'j','джха':'J','н̃а':'Y','йа':'y','श':'Z',
    //   'т̣а':'w','т̣ха':'x','д̣а':'f','д̣ха':'q','н̣а':'н','ра':'р','ष':'с',
    // 'та':'т','тха':'т','да':'д','дха':'д','на':'н','ла':'л','са':'с',
    //  'па':'п','пха':'п','ба':'б','бха':'б','ма':'м','ва':'в','л̣а':'л','м̣':'м',
    //  'а':'а','и':'и','у':'у','е':'е','о':'о','а̄':'аа','ӣ':'ии','ӯ':'уу',
    //  'а̄':'а','и':'и','ӣ':'ии','у':'у','ӯ':'уу','е':'е','о':'о', 
    //   '':'в',  
    // }

    const inverseTable=tbl=>{
        const out={};
        for (let key in tbl) out[ tbl[key] ]=key;
        return out;
    };

    const tables={
        hi:inverseTable(devanagari), my:inverseTable(myanmar),
        th:inverseTable(thai),       km:inverseTable(khmer),
        lo:inverseTable(lao),       si:inverseTable(sinhala),
        tb:inverseTable(tibetan) //,    cy:inverseTable(cyrillic),
    };
    const convertToIndic=(content,table)=>{ //pure text, no tag
        let i=0,out=[];    while (i<content.length) {
            let o= table[ (content[i]+content[i+1])];
            if (o) {
                i++;
            } else o=table[content[i]];
            if (o) out+=o; else out+=content[i];
            i++;
        }
        return out;
    };

    const toIndic=(content,lang='hi')=>{
        const table=tables[lang];
        return table?convertToIndic(content,table):content;
    };

    //for importing CST
    const fromDevanagari=content=>{
        const tokens=content.split(/([ऀ-ॿ]+)/);
        let out='';
        tokens.forEach(tk => {
            if (!tk.match(/[ऀ-ॿ]/)) {
                out+=tk;
            } else {
                for (let i=0;i<tk.length;i++) {
                    const ch=devanagari[tk[i]];
                    if (typeof ch=='undefined') {
                        console.log('wrong char',tk[i],tk);
                    } else {
                        out+=ch;                   
                    }
                }
            }
        });
        // out=out.replace(/\u200d/g,'');
        out=out.replace(/[ऀ-ॿ]/g,''); //drop all unknown
        return out;
    };

    const reg_syllable=/([a-zBKGNCDFHJLPQRSTWXYZ](V[a-zKGNCDFHJLPQRSTWXYZ])*[AEIUOM]*)/g;
    const breakSyllable=str=>{
        return str.split(reg_syllable);
    };

    exports.breakIASTSyllable = breakIASTSyllable;
    exports.breakSyllable = breakSyllable;
    exports.convertIASTSyllable = convertIASTSyllable;
    exports.convertToIndic = convertToIndic;
    exports.fromDevanagari = fromDevanagari;
    exports.fromIAST = fromIAST;
    exports.isRomanized = isRomanized;
    exports.toIAST = toIAST;
    exports.toIndic = toIndic;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
