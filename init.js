const fs = require( 'fs' );
const inq = require( 'inquirer' );

const args = process.argv.slice( 2 );

const mock = {
    title: 'ORM',
    modNum: 13,
    lessons: [
        { title: 'First Lesson Title', sections: [ 'Intro', 'sub one', 'sub two' ] },
        { title: 'Second Lesson Title', sections: [ 'Intro', 'sub one', 'sub two' ] },
        { title: 'Third Lesson Title', sections: [ 'Intro', 'sub one', 'sub two' ] }
    ]
}

const challengeSection = `
<!-- CHALLENGE -->
***
<div style=" display: flex; justify-content: space-between; align-items: center;">
  <h2>*Challenge Title*</h2>
  <div style=" text-align:right; ">
    <h4 id="challenge" style="margin: 0">
      Challenge</h4> | 
    <a href="#lesson-5">prev</a> <- **Fix me!|
    <a href="#index">index</a> |
  </div>
</div>

<div style="font-weight: 100;">

[▹ Your Task](#your-task) \\
[▹ User Story](#user-story) \\
[▹ Mockup](#mockup) \\
[▹ Getting Started](#getting-started) \\
[▹ Grading Requirements](#grading-requirements) \\
[▹ Submit Challenge](#submit-challenge) \\
[](#)

</div>

### Your Task

<a href="#challenge"> ⌃ </a>

### User Story

<a href="#challenge"> ⌃ </a>

### Mockup

<a href="#challenge"> ⌃ </a>

### Getting Started

<a href="#challenge"> ⌃ </a>

### Grading Requirements

<a href="#challenge"> ⌃ </a>

### Submit Challenge

<a href="#challenge"> ⌃ </a>
`

const titleQuestions = [
    {
        type: 'input',
        name: 'title',
        message: 'Enter your module title (eg, "13-orm"):'
    },
    {
        type: 'input',
        name: 'modNum',
        message: 'Which module number is this? (eg, 14): ',
        validate( modNum ) {
            return !isNaN( modNum );
        }
    }
]

const addSectionQuestion = sectionType => [ {
    type: 'input',
    name: 'title',
    message: `Enter ${ sectionType } Title:`
} ];

const numSections = [ {
    type: 'number',
    name: 'sectionCount',
    message: 'How many subsections are in this lesson?'
} ]

const confirmContinue = sectionType => [ {
    type: 'confirm',
    name: 'shouldContinue',
    message: `Add another ${ sectionType }?`,
    default: true
} ]

// _____) TEMPLATES (_____
const makeTitle = function ( title, modNum ) {
    let section = `
<div style="font-size: 14px;">
<div style=" display: flex; justify-content: space-between; align-items: center;">
    <h1>${ title }</h1>
    <div style=" text-align:right; ">
    <h4 id="#" style="margin: 0">
        Module ${ modNum }</h4> | 
    <a href="#index">index</a> |
    <a href="#index">next</a> |
    </div>
</div>
    `;
    return section
};

// function to parse title for id vs for View
const handleFormatting = function ( text, isAnchor ) {
    // change spaces ' ' to dashes '-'
    if ( isAnchor ) {
        let parsed = text.toLowerCase().split( ' ' ).join( '-' );
        return parsed
    }
    return text.split( ' ' ).map( w => w[ 0 ].toUpperCase() + w.slice( 1, w.length ) ).join( ' ' );
};

const makePagination = function ( current, last ) {
    let index = 'index';
    if ( current <= 1 ) {
        return `<a href="#${ index }">prev</a> |
      <a href="#${ index }">index</a> |
      <a href="#lesson-${ current + 1 }">next</a> |        
`
    }
    if ( current === last ) {
        let challenge = 'challenge'
        return `<a href="#lesson-${ current - 1 }">prev</a> |
      <a href="#${ index }">index</a> |
      <a href="#${ challenge }">next</a> |        
`
    }
    return `<a href="#lesson-${ current - 1 }">prev</a> |
    <a href="#${ index }">index</a> |
    <a href="#lesson-${ current + 1 }">next</a> |        
`};

const makeIntro = function ( title, modNum ) {
    let intro = `
${ makeTitle( title, modNum ) }
[Curriculum Overview](../overview.md)
`;
    return intro;
}

const makeIndex = function ( title, lessons ) {

    let tempStr = `
<!-- INDEX  -->
<div style=" display: flex; justify-content: space-between; align-items: center;">
    <h2>Index</h2>
    <div style=" text-align:right; ">
    <h4 id="index" style="margin: 0">
        Index</h4> | 
    <a href="#index">prev</a> |
    <a href="#index">index</a> |
    <a href="#intro">next</a> |
    </div>
</div>
    
<div style="font-size: 14px;">
`;

    for ( let i = -1; i < lessons.length + 1; i++ ) {
        if ( i === -1 ) {
            tempStr += `
- [${ title }](#)
- [Intro](#intro)`;
        } else if ( i < lessons.length ) {
            let lessonNum = i + 1
            tempStr += `
- [Lesson ${ lessonNum }](#lesson-${ lessonNum }) - ${ lessons[ i ].title }`;
        } else {
            tempStr += `
- [Challenge](#challenge) - 

</div>`;
        }
    }

    return tempStr;
}

const makeSubIndex = function ( modNum, lessonNum, numSections ) {

    let tempStr = `<div style="font-weight: 100; font-size: 14px;">

`;

    for ( let i = 0; i < numSections; i++ ) {
        let subIndex = i + 1;
        if ( i < numSections - 1 ) {
            tempStr += `[${ modNum }-${ lessonNum }-${ subIndex }](#${ modNum }-${ lessonNum }-${ subIndex })  \\
`;
        } else {
            tempStr += `[${ modNum }-${ lessonNum }-${ subIndex }](#${ modNum }-${ lessonNum }-${ subIndex }) Reflection 
`;
        }
    }

    return tempStr + '\n</div>';
}

const makeSubSections = function ( modNum, lessonNum, numSections ) {

    let tempStr = ``;

    for ( let i = 0; i < numSections; i++ ) {
        const subIndex = i + 1;
        tempStr += `
<div style=" display: flex; justify-content: space-between; align-items: center;">
  <h3  id="${ modNum }-${ lessonNum }-${ subIndex }"> ${ modNum }.${ lessonNum }.${ subIndex } - 
    *Sub-Section Title*
  </h3> 
  <div style="text-align:right; display: flex; flex-direction: column;">
    <a href="#lesson-${ lessonNum }"> Up </a><a href="#index"> Index </a> 
  </div>
</div>
`
    }
    return tempStr;
}

const makeSections = function ( lessons, modNum ) {

    let tempStr = `
<!-- INTRO  -->
<div style=" display: flex; justify-content: space-between; align-items: center;">
  <h2>Intro</h2>
  <div style=" text-align:right; ">
    <h4 id="intro" style="margin: 0">
      Introduction</h4> | 
    <a href="#index">prev</a> |
    <a href="#index">index</a> |
    <a href="#lesson-1">next</a> |
  </div>
</div>`;

    for ( let i = 0; i < lessons.length; i++ ) {
        const lessonNum = i + 1;
        tempStr += `
<div style=" display: flex; justify-content: space-between; align-items: center;">
  <h2 id="lesson-${ lessonNum }">${ handleFormatting( lessons[ i ].title, false ) }</h2>
  <div style=" text-align:right; ">
    <h4 style="margin:0;">Lesson ${ lessonNum }</h4> |
    ${ makePagination( lessonNum, lessons.length ) }
  </div>
</div>

${ makeSubIndex( modNum, lessonNum, lessons[ i ].numSections ) }

${ makeSubSections( modNum, lessonNum, lessons[ i ].numSections ) }

`
    }
    return tempStr;
}

const template = function ( response ) {
    const { title, modNum, lessons } = response;
    return `
${ makeIntro( title, modNum ) }
${ makeIndex( title, lessons ) }
${ makeSections( lessons, modNum ) }
${ challengeSection }
`};

const makeFile = function ( modNum, fileContents ) {
    const path = `../mod-${ modNum }-notes.md`
    fs.writeFileSync( path, fileContents, ( err ) => {
        if ( err ) {
            return console.log( 'Error: ' + err );
        }
        console.log( 'File written successfully to: ' + path );
    } );
};

const getLessons = async function ( responseArray, sectionType ) {
    let title = await inq.prompt( addSectionQuestion( sectionType ) );

    responseArray.push( title );
    let { shouldContinue } = await inq.prompt( confirmContinue( sectionType ) );
    if ( shouldContinue ) {
        return getLessons( responseArray, sectionType );
    }

    return responseArray;
}
const getSections = async function ( responseArray, sectionType ) {
    let title = await inq.prompt( addSectionQuestion( sectionType ) );

    responseArray.push( title );
    let { shouldContinue } = await inq.prompt( confirmContinue( sectionType ) );
    if ( shouldContinue ) {
        return getSections( responseArray, sectionType );
    }

    return responseArray;
}

const initialize = async function () {


    const getMock = await inq.prompt( titleQuestions )

    let lessons = [];

    lessons = await getLessons( lessons, 'Lesson' );

    for ( let lesson of lessons ) {
        const { sectionCount } = await inq.prompt( numSections );
        console.log( 'sectionCount', sectionCount )
        lesson.numSections = sectionCount;
    }

    getMock.lessons = lessons;

    // console.log( getMock );

    let templateStr = template( getMock );
    // let templateStr = template( mock );

    makeFile( getMock.modNum, templateStr );
};

initialize();
