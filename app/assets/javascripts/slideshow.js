// Client-side full-screen logic - fallback incase we're in "offline" mode
if ( window.location.toString().match( "full=true" ) ) {
  Slideshow.fullScreen = true;
  $( 'button.start-slideshow' ).remove();
  $( '.slideshow.preview' ).remove();
  $( '.slideshow' ).addClass( 'full' );
}

if ( !Slideshow.fullScreen ) {
  Slideshow.activeSlide = 0;

  $( '.slideshow.preview' ).on( 'click', '.slideshow-slide', function() {
    var $this = $( this ),
      index = $( '.slideshow.preview .slideshow-slide' ).index( $this );

    showSlide( index );
  });

  var backgroundList = [
    'tweed.png',
    'binding_dark.png',
    'grey_wash_wall.png',
    'slash_it.png',
    'simple_dashed.png',
    'moulin.png',
    'dark_exa.png',
    'dark_dotted.png',
    'dark_dotted2.png',
    'pw_maze_black.png'
  ];

  function rand(int) {
    return Math.floor(Math.random() * int);
  }

  var diffX, diffY,
    $bgDrag = $( '.slideshow-backgrounds-background.draggable' ),
    bgTracker = new WebPro.DragTracker( $bgDrag, {
      dragUpdate: function( tracker, dx, dy ) {
        var x = tracker.startX + dx - diffX
            y = tracker.startY + dy - diffY;

        $( tracker.element ).css({
          'position': 'absolute',
          'top': y + 'px',
          'left': x + 'px'
        });
      },
      dragStop: function( tracker, dx, dy ) {
        var $preview = $('.slideshow.preview'),
            $separators = $('.separator'),
            x = tracker.startX + dx - diffX
            y = tracker.startY + dy - diffY,
            left = $preview.offset().left,
            right = $preview.outerWidth() - left,
            top = $preview.offset().top,
            bottom = $preview.outerHeight() - top;

        if ( x <= right && x >= left && y <= bottom && y >= top ) {
          var top = 0, bottom,i=0;
          $separators.each(function() {
            bottom = $(this).offset().top - $preview.scrollTop();
            if ( y <= bottom && y >= top ) {
              setSongBackground(i,$bgDrag.css('background-image'));
              $bgDrag.hide();
              return false;
            }

            top = $(this).offset().top;
            i++;
          });
        } else {
          $bgDrag.hide();
        }
      }
    });

  $( '.slideshow-backgrounds .slideshow-backgrounds-background' ).on( 'mousedown', function( evt ) {
    $bgDrag.css({
      'display': 'block',
      'background-image': $(this).css('background-image'),
      'top': $(this).offset().top + 'px',
      'left': $(this).offset().left + 'px'
    });
    diffX = evt.pageX - $(this).offset().left;
    diffY = evt.pageY - $(this).offset().top;
    bgTracker._startDrag( evt );
  });

  $( '.start-slideshow' ).on( 'click', function() {
    Slideshow.fsWin = window.open(window.location.toString() + '?full=true');

    Slideshow.fsWin.onload = function() {
      window.$$ = Slideshow.fsWin.$;

      var $slideshow = $( '.slideshow.preview' ),
          color = $slideshow.css('color'),
          textShadow = $slideshow.css('text-shadow'),
          $$slideshow = $$( '.slideshow:not(.preview)' );

      $$slideshow.css({
        'background': 'url(' + Slideshow.background + ')',
        'color': color,
        'text-shadow': textShadow
      });

      var index = $( '.slideshow:not(.preview) .slideshow-slide' ).index( '.slideshow:not(.preview) .slideshow-slide.active' ),
        $$previews = $$( '.slideshow.preview .slideshow-slide' ),
        $$slides = $$( '.slideshow:not(.preview) .slideshow-slide' ),
        $$preview = $$( '.slideshow.preview .slideshow-slide:eq(' + index + ')' ),
        $$slide = $$( '.slideshow:not(.preview) .slideshow-slide:eq(' + index + ')' );

      $$previews.removeClass( 'active' );
      $$preview.addClass( 'active' );

      $$slides.removeClass( 'active' );
      $$slide.addClass( 'active' );

      showSlide(0);
    };
  });

  $( '.edit-slideshow' ).on( 'click', function() {
    var $preview = $( '.slideshow.preview' );

    $( 'body' ).addClass( 'edit' );
    $preview.find( '.slideshow-slide-content' ).attr( 'contenteditable', 'true' );
  });

  $( '.done-editing-slideshow' ).on( 'click', function() {
    var $preview = $( '.slideshow.preview' );

    $( 'body' ).removeClass( 'edit' );
    $preview.find( '.slideshow-slide-content' ).attr( 'contenteditable', 'false' );
  });

  $( '.button.add-slide' ).on( 'click', function() {
    var $sep = $( this ).parent();
    var $clone = $sep.prev().clone( true, true );
    $clone.find( '.slideshow-slide-content' ).text( '' );
    $clone.insertBefore( $sep );
  })

  var random = rand(Slideshow.backgrounds.length);
  Slideshow.background = '/assets/ss-backgrounds/' + Slideshow.backgrounds[random];
  Slideshow.bgImg = document.createElement( 'img' );
  Slideshow.bgImg.src = Slideshow.background;
  Slideshow.bgImg.onload = function() {
    color = getAverageRGB(this);
    if ( ( color.r + color.g + color.b ) / 3 > 130 ) {
      $( '.slideshow:not(.preview)' ).css({
        'color': '#222',
        'text-shadow': '1px 2px 2px #ddd'
      });
      $('.slideshow.preview .separator').each(function() {
        var $first = $( this ).next();
        $first.css( 'background', 'url(' + Slideshow.background + ')' );
        $first.css('color','#222');
        $first.css('text-shadow','1px 2px 2px #ddd');
      });
      var $first = $( '.slideshow.preview .slideshow-slide:first' );
      $first.css( 'background', 'url(' + Slideshow.background + ')' );
      $first.css('color','#222');
      $first.css('text-shadow','1px 2px 2px #ddd');
      $( '.slideshow.preview .slideshow-slide' ).data( 'color', '#222' );
      $( '.slideshow.preview .slideshow-slide' ).data( 'text-shadow', '1px 2px 2px #ddd' );
    } else {
      $('.slideshow.preview .separator').each(function() {
        var $first = $( this ).next();
        $first.css( 'background', 'url(' + Slideshow.background + ')' );
        $first.css('color','#fff');
        $first.css('text-shadow','1px 2px 2px rgba(0,0,0,0.5)');
      });
      var $first = $( '.slideshow.preview .slideshow-slide:first' );
      $first.css( 'background', 'url(' + Slideshow.background + ')' );
      $first.css('color','#fff');
      $first.css('text-shadow','1px 2px 2px rgba(0,0,0,0.5)');
      $( '.slideshow.preview .slideshow-slide' ).data( 'color', '#fff' );
      $( '.slideshow.preview .slideshow-slide' ).data( 'text-shadow', '1px 2px 2px rgba(0,0,0,0.5)' );
    }
  };
  $( '.slideshow.preview .slideshow-slide' ).data( 'background', 'url(' + Slideshow.background + ')' );

  var $slideshow = $( '.slideshow:not(.preview)' );
  $slideshow.css( 'url(' + Slideshow.background + ')' );

  showSlide(0);
}

function setSongBackground(index, bg) {
  var $slides = $( '.slideshow.preview .slideshow-view>div' ),
      $separator = $( '.separator:eq(' + index + ')' ),
      domIndex = $slides.index($separator),
      $songs;

  if ( index == 0 ) {
    $songs = $('.slideshow.preview .slideshow-view>div:lt(' + domIndex + ')' );
  } else {
    firstIndex = $slides.index($('.separator:eq(' + (index-1) + ')'));
    $songs = $('.slideshow.preview .slideshow-view>div' ).slice(firstIndex+1,domIndex);
  }

  $songs.data('background',bg);
  var $first = $songs.first();
  $first.css('background-image',bg);
  var img = document.createElement('img');
  img.src = bg.replace( /url/, '' ).replace( /\(/, '' ).replace( /\)/, '' );
  img.onload = function() {
    var color = getAverageRGB(this);
    if ( ( ( color.r + color.g + color.b ) / 3 ) > 130 ) { 
      $first.css({
        'color': '#222',
        'text-shadow': '1px 2px 2px #ddd'
      });
      $songs.data('color','#222');
      $songs.data('text-shadow','1px 2px 2px #ddd');
    } else {
      $first.css({
        'color': '#fff',
        'text-shadow': '1px 2px 2px rgba(0,0,0,0.5)'
      });
      $songs.data('color','#fff');
      $songs.data('text-shadow','1px 2px 2px rgba(0,0,0,0.5)');
    }
    showSlide(Slideshow.activeIndex);
  };
}

function showSlide( index ) {
    Slideshow.activeIndex = index;
    var $previews = $( '.slideshow.preview .slideshow-slide' ),
      $slides = $( '.slideshow:not(.preview) .slideshow-slide' ),
      $preview = $( '.slideshow.preview .slideshow-slide:eq(' + index + ')' ),
      $slide = $( '.slideshow:not(.preview) .slideshow-slide:eq(' + index + ')' ),
      bg = $preview.data( 'background' ),
      color = $preview.data( 'color' ),
      textShadow = $preview.data( 'text-shadow' ),
      text = $preview.find( '.slideshow-slide-content' ).text();

    $previews.removeClass( 'active' );
    $preview.addClass( 'active' );

    $slides.removeClass( 'active' );
    $slide.addClass( 'active' );
    $slide.css('background',bg);
    $slide.css('color',color);
    $slide.css('text-shadow',textShadow);
    $slide.find( '.slideshow-slide-content' ).text( text );

    if ( Slideshow.fsWin ) {
      var $$previews = $$( '.slideshow.preview .slideshow-slide' ),
        $$slides = $$( '.slideshow:not(.preview) .slideshow-slide' ),
        $$preview = $$( '.slideshow.preview .slideshow-slide:eq(' + index + ')' ),
        $$slide = $$( '.slideshow:not(.preview) .slideshow-slide:eq(' + index + ')' );

      $$previews.removeClass( 'active' );
      $$preview.addClass( 'active' );

      $$slides.removeClass( 'active' );
      $$slide.addClass( 'active' );
      $$slide.css('background',bg);
      $$slide.css('color',color);
      $$slide.css('text-shadow',textShadow);
      $$slide.find( '.slideshow-slide-content' ).text( text );
    }
}

function getAverageRGB(imgEl) {

    var blockSize = 5, // only visit every 5 pixels
        defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = {r:0,g:0,b:0},
        count = 0;

    if (!context) {
        return defaultRGB;
    }

    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

    context.drawImage(imgEl, 0, 0);

    try {
        data = context.getImageData(0, 0, width, height);
    } catch(e) {
        /* security error, img on diff domain */
        return defaultRGB;
    }

    length = data.data.length;

    while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i+1];
        rgb.b += data.data[i+2];
    }

    // ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);

    return rgb;
}
