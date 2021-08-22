const {fromIAST,toIAST,toESpeak} =window.providentpali;

const stockPhrases={
    "itipi so":"‘itipi so bhagavā arahaṃ sammāsambuddho vijjācaraṇasampanno sugato lokavidū anuttaro purisadammasārathi satthā devamanussānaṃ buddho bhagavā’ti;  ‘svākkhāto bhagavatā dhammo, sandiṭṭhiko akāliko ehipassiko opaneyyiko paccattaṃ veditabbo viññūhī’ti; ‘suppaṭipanno bhagavato sāvakasaṅgho, ujuppaṭipanno bhagavato sāvakasaṅgho, ñāyappaṭipanno bhagavato sāvakasaṅgho, sāmīcippaṭipanno bhagavato sāvakasaṅgho, yadidaṃ cattāri purisayugāni, aṭṭha purisapuggalā. Esa bhagavato sāvakasaṅgho āhuneyyo pāhuneyyo dakkhiṇeyyo añjalikaraṇīyo, anuttaraṃ puññakkhettaṃ lokassā’ti.",
    "evam me sutam":"evaṃ me sutaṃ – ekaṃ samayaṃ bhagavā sāvatthiyaṃ viharati jetavane anāthapiṇḍikassa ārāme.",
    "saranam":"Buddhaṃ saraṇaṃ gacchāmi; Dhammaṃ saraṇaṃ gacchāmi; Saṅghaṃ saraṇaṃ gacchāmi. \nDutiyampi buddhaṃ saraṇaṃ gacchāmi; Dutiyampi dhammaṃ saraṇaṃ gacchāmi; Dutiyampi saṅghaṃ saraṇaṃ gacchāmi. \nTatiyampi buddhaṃ saraṇaṃ gacchāmi; Tatiyampi dhammaṃ saraṇaṃ gacchāmi; Tatiyampi saṅghaṃ saraṇaṃ gacchāmi.",
    'panca sila':`Pāṇātipātā veramaṇī-sikkhāpadaṃ  samādiyāmi.
Adinnādānā veramaṇī-sikkhāpadaṃ samādiyāmi.
Abrahmacariyā veramaṇī-sikkhāpadaṃ samādiyāmi.
Musāvādā veramaṇī-sikkhāpadaṃ samādiyāmi.
Surāmerayamajjapamādaṭṭhānā veramaṇī-sikkhāpadaṃ samādiyāmi.
Vikālabhojanā veramaṇī-sikkhāpadaṃ samādiyāmi.
Nacca-gīta-vādita-visūkadassanā veramaṇī-sikkhāpadaṃ samādiyāmi.
Mālā-gandha-vilepana-dhāraṇa-maṇḍana-vibhūsanaṭṭhānā veramaṇī-sikkhāpadaṃ samādiyāmi.
Uccāsayana-mahāsayanā veramaṇī-sikkhāpadaṃ samādiyāmi.
Jātarūpa-rajatapaṭiggahaṇā veramaṇī-sikkhāpadaṃ samādiyāmi.`,
"dhammacakka":"Pavattite ca pana bhagavatā dhammacakke bhummā devā saddamanussāvesuṃ – “etaṃ bhagavatā bārāṇasiyaṃ isipatane migadāye anuttaraṃ dhammacakkaṃ pavattitaṃ appaṭivattiyaṃ samaṇena vā brāhmaṇena vā devena vā mārena vā brahmunā vā kenaci vā lokasmi”nti. Bhummānaṃ devānaṃ saddaṃ sutvā cātumahārājikā devā saddamanussāvesuṃ – “etaṃ bhagavatā bārāṇasiyaṃ isipatane migadāye anuttaraṃ dhammacakkaṃ pavattitaṃ, appaṭivattiyaṃ samaṇena vā brāhmaṇena vā devena vā mārena vā brahmunā vā kenaci vā lokasmi”nti. Cātumahārājikānaṃ devānaṃ saddaṃ sutvā tāvatiṃsā devā…pe… yāmā devā…pe… tusitā devā…pe… nimmānaratī devā…pe… paranimmitavasavattī devā…pe… brahmakāyikā devā saddamanussāvesuṃ – “etaṃ bhagavatā bārāṇasiyaṃ isipatane migadāye anuttaraṃ dhammacakkaṃ pavattitaṃ appaṭivattiyaṃ samaṇena vā brāhmaṇena vā devena vā mārena vā brahmunā vā kenaci vā lokasmi”nti.",
"mahasatipatthana":"“Ekāyano ayaṃ, bhikkhave, maggo sattānaṃ visuddhiyā, sokaparidevānaṃ samatikkamāya, dukkhadomanassānaṃ atthaṅgamāya, ñāyassa adhigamāya, nibbānassa sacchikiriyāya, yadidaṃ cattāro satipaṭṭhānā.\n“Katame cattāro? Idha, bhikkhave, bhikkhu kāye kāyānupassī viharati ātāpī sampajāno satimā, vineyya loke abhijjhādomanassaṃ; vedanāsu vedanānupassī viharati ātāpī sampajāno satimā, vineyya loke abhijjhādomanassaṃ; citte cittānupassī viharati ātāpī sampajāno satimā, vineyya loke abhijjhādomanassaṃ; dhammesu dhammānupassī viharati ātāpī sampajāno satimā, vineyya loke abhijjhādomanassaṃ."
}
const toggleFont =()=>{
    const o=document.getElementById("output");
    o.className=btnfont.checked?'provident':'noprovident';
}
const utf8length=str=>{
    let c=0;
    for (let i=0;i<str.length;i++) {
        const cp=str.charCodeAt(i);
        if (cp<0x80) c++;
        else if (cp<0x400) c+=2;
        else c+=3;
    }
    return c;
}
const saved=str=>{
    const ppali=fromIAST(str,{format:'xml'})
    return (utf8length(ppali)*100 / utf8length(str) ).toFixed(2) +'%'
}  

const convertFromIAST=str=>{
    const s=fromIAST(str,{format:'xml'});
    document.querySelector("#output").value=s;

    const r=saved(str);
    document.querySelector("#msg").innerHTML=r+' bytes in UTF-8';

    // document.querySelector("#espeak").value=toESpeak(s);
}
const convertFromProvident=str=>{
    const s=toIAST(str,{format:'xml'});
    document.querySelector("#iast").value=s;
}

const showsutta=key=>{
    if (typeof key!=='string') key=key.target.innerText
    const str=stockPhrases[key];
    if (!str)return;
    document.querySelector("#iast").value=str;
    convertFromIAST(str);
}
let timer=0;
const from_iast=()=>{
    clearTimeout(timer);
    timer=setTimeout(()=>{
        convertFromIAST(document.querySelector("#iast").value);

    },200);
}
const to_iast=()=>{
    clearTimeout(timer);
    timer=setTimeout(()=>{
        convertFromProvident(document.querySelector("#output").value);
    },200);
}

const init=()=>{
    showsutta("panca sila");
}