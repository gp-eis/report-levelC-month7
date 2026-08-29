const $ = id => document.getElementById(id);

const weekData = {
  1: { title:'In the Park', hero:'assets/weekly/week-1-card-hero.png', heroAlt:'Gerry and Penny exploring the park with a friendly dog' },
  2: { title:'In the Garden', hero:'assets/weekly/week-2-card-hero.png', heroAlt:'Coover and Penny exploring the garden with a cheerful duck' },
  3: { title:'In the Yard', hero:'assets/weekly/week-3-card-hero.png', heroAlt:'Don and Gerry exploring the yard with a friendly snake' },
  4: { title:'In the Cave', hero:'assets/weekly/week-4-card-hero.png', heroAlt:'Ria and Penny exploring a cave with a colorful bird' }
};

const sampleQuestionSets = {
  1: [
    {section:'Phonics',position:1,tag:'SOUND TRAIL',icon:'🔤',q:'Which word has the ai vowel team?',hint:'Listen, then choose the best answer.',choices:['rain','tree'],answer:0,practice:'It is in the rain.'},
    {section:'Sentences',position:6,tag:'PARK RULE',icon:'🌳',q:'Choose the correct dog park sentence.',hint:'Think about a safe and caring choice.',choices:['You should give your dog water.','You should hurt other dogs.'],answer:0,practice:'You should give your dog water.'},
    {section:'Reading',position:11,tag:'ANIMAL ACTION',icon:'🐕',q:'What is the dog doing?',hint:'Choose the sentence that matches the action.',choices:['The dog is sitting.','The dog is flying.'],answer:0,practice:'The dog is sitting.'},
    {section:'Math',position:16,tag:'MATH TRAIL',icon:'🔢',q:'Your Week 1 Math question will appear here.',hint:'This temporary card shows the Math interface only.',choices:['Math answer choice','Another answer choice'],answer:0,practice:'Your Math practice sentence will appear here.',placeholder:true}
  ],
  2: [
    {section:'Phonics',position:1,tag:'SOUND TRAIL',icon:'🔤',q:'Which word ends with the ay vowel team?',hint:'Listen, then choose the best answer.',choices:['play','leaf'],answer:0,practice:'It can play in the rain.'},
    {section:'Sentences',position:6,tag:'GARDEN GRAMMAR',icon:'🌻',q:'Choose the correct word: I can ___ a butterfly.',hint:'Use find for something you can see now.',choices:['find','found'],answer:0,practice:'I can find a butterfly in my garden.'},
    {section:'Reading',position:11,tag:'GARDEN READING',icon:'🦆',q:'Which sentence describes the picture lesson?',hint:'Remember the garden description activity.',choices:['The grass is short.','The grass is flying.'],answer:0,practice:'The grass is short.'},
    {section:'Math',position:16,tag:'MATH TRAIL',icon:'🔢',q:'Your Week 2 Math question will appear here.',hint:'This temporary card shows the Math interface only.',choices:['Math answer choice','Another answer choice'],answer:0,practice:'Your Math practice sentence will appear here.',placeholder:true}
  ],
  3: [
    {section:'Phonics',position:1,tag:'SOUND TRAIL',icon:'🔤',q:'Which word has the ee vowel team?',hint:'Listen, then choose the best answer.',choices:['tree','rain'],answer:0,practice:'He is in the tree.'},
    {section:'Sentences',position:6,tag:'LOCATION CLUE',icon:'🐍',q:'Complete the sentence: The snake is ___ the leaves.',hint:'Choose the word that means hidden at the back.',choices:['behind','on'],answer:0,practice:'The snake is behind the leaves.'},
    {section:'Reading',position:11,tag:'JUNGLE READING',icon:'🦜',q:'Which is a safe jungle choice?',hint:'Remember the jungle rules activity.',choices:['You should stay on the path.','You should shout and scream.'],answer:0,practice:'You should stay on the path.'},
    {section:'Math',position:16,tag:'MATH TRAIL',icon:'🔢',q:'Your Week 3 Math question will appear here.',hint:'This temporary card shows the Math interface only.',choices:['Math answer choice','Another answer choice'],answer:0,practice:'Your Math practice sentence will appear here.',placeholder:true}
  ],
  4: [
    {section:'Phonics',position:1,tag:'SOUND TRAIL',icon:'🔤',q:'Which word has the ea vowel team?',hint:'Listen, then choose the best answer.',choices:['leaf','play'],answer:0,practice:'Look at the leaf.'},
    {section:'Sentences',position:6,tag:'FEELING WORD',icon:'🐦',q:'Complete the sentence: The bird is ___ of the eagle.',hint:'Scared describes how someone feels.',choices:['scared','scary'],answer:0,practice:'The bird is scared of the eagle.'},
    {section:'Reading',position:11,tag:'BIRD PARK RULE',icon:'🔭',q:'Which is a good way to watch birds?',hint:'Remember the bird park safety activity.',choices:['You should use binoculars.','You should touch bird nests.'],answer:0,practice:'You should use binoculars to watch birds.'},
    {section:'Math',position:16,tag:'MATH TRAIL',icon:'🔢',q:'Your Week 4 Math question will appear here.',hint:'This temporary card shows the Math interface only.',choices:['Math answer choice','Another answer choice'],answer:0,practice:'Your Math practice sentence will appear here.',placeholder:true}
  ]
};

const sectionMeta = {
  Phonics:{start:1,tag:'SOUND TRAIL',icon:'🔤'},
  Sentences:{start:6,tag:'KEY SENTENCE TRAIL',icon:'💬'},
  Reading:{start:11,tag:'READING TRAIL',icon:'📖'},
  Math:{start:16,tag:'MATH TRAIL',icon:'🔢'}
};

function buildPreviewWeek(samples){
  return Object.entries(sectionMeta).flatMap(([section,meta])=>{
    const sample=samples.find(item=>item.section===section);
    return Array.from({length:5},(_,index)=>index===0
      ? {...sample,position:meta.start}
      : {
          section,
          position:meta.start+index,
          tag:meta.tag,
          icon:meta.icon,
          q:`${section} question ${index+1} is waiting for the approved lesson.`,
          hint:'This slot is reserved so the full 20-question journey can be tested safely.',
          choices:['Continue the interface preview'],
          answer:null,
          practice:'Curriculum content will be added here after approval.',
          pending:true
        });
  });
}

const questionSets = Object.fromEntries(
  Object.entries(sampleQuestionSets).map(([week,samples])=>[week,buildPreviewWeek(samples)])
);

const sectionColors = {Phonics:'#ec6c8c',Sentences:'#e9ad3e',Reading:'#4b94ce',Math:'#50a66b'};
let activeWeek = 1;
let student = 'Explorer';
let questions = questionSets[1];
let current = 0;
let answers = [];
let reportBlob = null;
let reportUrl = '';

function showScreen(id){
  document.querySelectorAll('.screen').forEach(screen => screen.classList.toggle('active',screen.id===id));
  window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}

function speak(text){
  if(!text || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/___/g,'blank'));
  utterance.lang='en-US'; utterance.rate=.86; utterance.pitch=1.03;
  const voices=speechSynthesis.getVoices();
  const voice=voices.find(item=>item.lang==='en-US'&&/Samantha|Jenny|Aria|Ava|Google US English/i.test(item.name))||voices.find(item=>item.lang==='en-US');
  if(voice) utterance.voice=voice;
  speechSynthesis.speak(utterance);
}

function selectWeek(week){
  activeWeek=week; questions=questionSets[week]; current=0; answers=[];
  const data=weekData[week];
  $('week-hero-image').src=data.hero; $('week-hero-image').alt=data.heroAlt;
  document.querySelector('.welcome-scene').setAttribute('aria-label',data.heroAlt);
  $('week-pill').textContent=`Week ${week}`;
  showScreen('welcome'); setTimeout(()=>$('student-name').focus(),250);
}

function start(){
  student=$('student-name').value.trim()||'Explorer'; current=0; answers=[]; showScreen('quiz'); renderQuestion();
}

function renderQuestion(){
  const item=questions[current];
  $('section-label').textContent=item.section; $('progress-label').textContent=`${item.position} of 20`; $('leaf-number').textContent=item.position;
  $('progress-bar').style.width=`${item.position/20*100}%`; $('question-icon').textContent=item.icon; $('question-tag').textContent=item.tag;
  $('question-text').textContent=item.q; $('question-hint').textContent=item.hint; $('feedback').textContent=''; $('feedback').className='feedback';
  $('practice-popup').hidden=true; $('next-btn').classList.remove('show'); $('choices').innerHTML='';
  item.choices.forEach((choice,index)=>{
    const wrap=document.createElement('div'); wrap.className='choice-wrap';
    const button=document.createElement('button'); button.type='button'; button.className='choice'; button.dataset.index=index;
    button.textContent=choice;
    const small=document.createElement('small'); small.textContent=item.pending?'Continue to the next reserved slot':'Tap to choose'; button.appendChild(small);
    button.addEventListener('click',()=>choose(index));
    const listen=document.createElement('button'); listen.type='button'; listen.className='choice-listen';
    listen.setAttribute('aria-label',`Hear option: ${choice}`); listen.innerHTML='<span aria-hidden="true">🔊</span> Listen';
    listen.addEventListener('click',()=>speak(choice));
    wrap.append(button,listen); $('choices').appendChild(wrap);
  });
  setTimeout(()=>speak(item.q),350);
}

function choose(index){
  if(answers[current]!==undefined) return;
  const item=questions[current]; const correct=item.pending||index===item.answer; answers[current]=item.pending?null:index;
  document.querySelectorAll('.choice').forEach(button=>{
    const choiceIndex=Number(button.dataset.index); button.disabled=true;
    if(choiceIndex===index) button.classList.add('selected',correct?'correct':'wrong');
    if(!correct&&choiceIndex===item.answer) button.classList.add('reveal');
  });
  $('feedback').textContent=item.pending?'Reserved slot checked. No curriculum or score was invented.':item.placeholder?'Interface preview saved — we will replace this with your Math lesson.':correct?'Great discovery! That answer is correct. 🌟':'Good try! Practice the green answer and keep exploring.';
  $('feedback').classList.add(correct?'good':'try'); $('practice-text').textContent=item.practice; $('practice-popup').hidden=false;
  $('next-btn').textContent=current===questions.length-1?'See results design 🎉':'Next preview slot →'; $('next-btn').classList.add('show');
  speak(item.practice);
}

function nextQuestion(){
  if(answers[current]===undefined) return;
  if(current<questions.length-1){current+=1;renderQuestion()}else{showResults()}
}

function showResults(){
  const samples=questions.filter(item=>!item.pending);
  const correct=samples.reduce((sum,item)=>{const index=questions.indexOf(item);return sum+(answers[index]===item.answer?1:0)},0);
  const previewScore=correct*5; const percent=Math.round(correct/samples.length*100);
  $('score-number').textContent=previewScore; $('percent-badge').textContent=`${percent}%`; $('student-report-name').textContent=`${student}’s Week ${activeWeek} Report`;
  $('results-message').textContent=`Great job, ${student}! You explored the full 20-slot preview.`;
  $('score-title').textContent=percent>=75?'Super explorer!':'Growing explorer!'; $('score-note').textContent='Preview score based on one sample question from each section.';
  $('score-ring').style.background=`conic-gradient(var(--leaf) ${percent*3.6}deg,#e8eee9 0deg)`;
  $('skill-chart').innerHTML=Object.keys(sectionMeta).map(section=>{const index=questions.findIndex(item=>item.section===section&&!item.pending);const item=questions[index];const score=answers[index]===item.answer?5:0;return `<div class="skill-row"><span>${section}</span><div class="bar-track"><div class="bar-fill" style="width:${score*20}%;background:${sectionColors[section]}"></div></div><b>${score}/5</b></div>`}).join('');
  $('analysis-text').textContent=`${student}, your full field note will identify your strongest skill and the best next practice step after all 20 questions are added.`;
  $('answer-review').innerHTML=questions.map((item,index)=>item.pending
    ? `<div class="review-item pending"><span>🧭</span><span><b>${index+1}. ${item.section}</b><br>Reserved for approved curriculum</span><span>Pending</span></div>`
    : `<div class="review-item"><span>${answers[index]===item.answer?'✅':'🌱'}</span><span><b>${index+1}. ${item.section}</b><br>${item.q}</span><span>${answers[index]===undefined?'Not answered':item.choices[answers[index]]}</span></div>`).join('');
  showScreen('results');
}

function resetToWeeks(){
  if('speechSynthesis' in window) speechSynthesis.cancel(); current=0; answers=[]; $('week-pill').textContent='📅 Level C · Month 7'; showScreen('week-select');
}

async function captureReport(){
  const button=$('capture-btn'); const original=button.textContent; button.disabled=true; button.textContent='📸 Capturing…';
  try{
    const report=$('results'); report.classList.add('active');
    const canvas=await html2canvas(report,{backgroundColor:'#fffdf5',scale:Math.min(1.5,devicePixelRatio||1),useCORS:true,logging:false});
    reportBlob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png',.95));
    if(!reportBlob) throw new Error('No image');
    if(reportUrl) URL.revokeObjectURL(reportUrl); reportUrl=URL.createObjectURL(reportBlob); $('capture-image').src=reportUrl; $('capture-modal').hidden=false;
  }catch(error){alert('The report picture could not be created. Please try again.')}finally{button.disabled=false;button.textContent=original}
}

function fileName(){return `${student.toLowerCase().replace(/[^a-z0-9]+/g,'-')||'student'}-level-c-week-${activeWeek}-report.png`}
function downloadReport(){if(!reportBlob)return;const link=document.createElement('a');link.href=reportUrl;link.download=fileName();link.click();$('share-note').textContent='Your report picture has been downloaded!'}
async function shareReport(){if(!reportBlob)return;const file=new File([reportBlob],fileName(),{type:'image/png'});if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){try{await navigator.share({title:`${student}’s GP Report`,text:'My Level C Nature Expedition weekly report',files:[file]});return}catch(error){if(error.name==='AbortError')return}}downloadReport();$('share-note').textContent='Direct sharing is unavailable, so the report was downloaded.'}

document.querySelectorAll('.week-card').forEach(card=>card.addEventListener('click',()=>selectWeek(Number(card.dataset.week))));
$('home-logo').addEventListener('click',()=>{if(!$('quiz').classList.contains('active')||confirm('Return to weekly trails? Your preview answers will be cleared.'))resetToWeeks()}); $('all-weeks-btn').addEventListener('click',resetToWeeks); $('quit-btn').addEventListener('click',()=>{if(confirm('Return to weekly trails? Your preview answers will be cleared.'))resetToWeeks()});
$('start-btn').addEventListener('click',start); $('student-name').addEventListener('keydown',event=>{if(event.key==='Enter')start()});
$('question-listen').addEventListener('click',()=>speak(questions[current].q)); $('practice-replay').addEventListener('click',()=>speak(questions[current].practice));
$('next-btn').addEventListener('click',nextQuestion); $('preview-results-btn').addEventListener('click',showResults); $('restart-btn').addEventListener('click',()=>{showScreen('welcome');$('student-name').focus()});
$('reward-card').addEventListener('click',()=>{$('reward-modal').hidden=false}); $('reward-close').addEventListener('click',()=>{$('reward-modal').hidden=true});
$('capture-btn').addEventListener('click',captureReport); $('capture-close').addEventListener('click',()=>{$('capture-modal').hidden=true}); $('download-capture').addEventListener('click',downloadReport); $('share-capture').addEventListener('click',shareReport);
document.querySelectorAll('.modal').forEach(modal=>modal.addEventListener('click',event=>{if(event.target===modal)modal.hidden=true}));
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.modal').forEach(modal=>modal.hidden=true)});
