$(function() {
  $( '.add-to-setlist-link' ).each( function() {
    var display = new WebPro.Widget.Display( '.add-to-setlist.flyout', {
      trigger: $( this ),
      displayClass: 'show',
      hideClass: 'hide',
      displayEvent: 'click',
      activeClass: 'active',
      positionAround: {
        position: 'left',
        positionOffset: 10,
        align: 'top',
        alignOffset: -20
      }
    });
  });
  var flyoutTemplate = $( '#flyout-template' ).text();

  $( '.add-to-setlist.flyout' ).on( 'click', 'li:not(.head)', function() {
    var $this = $( this ),
      $flyout = $this.closest( '.flyout' ),
      $spinner = $this.find( '.icon-spin' ),
      $ok = $this.find( '.icon-ok' );
    $.ajax({
      url: '/setlist_songs.json',
      type: 'post',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({
        song_id: $flyout.data( 'song_id' ),
        data_key: $flyout.data( 'key' ),
        setlist_id: $this.data( 'id' )
      }),
      beforeSend: function() {
        $spinner.addClass( 'show' );
      },
      success: function ( data ) {
        $spinner.removeClass( 'show' );
        $ok.addClass( 'show' );
      }
    });
  }).on( 'wp-display-show', function( evt, trigger ) {
    var $this = $( this ),
      $trigger = $( trigger );
    $this.data( 'song_id', $trigger.data( 'id' ) );
    $this.data( 'key', $trigger.data( 'key' ) );
    $.ajax({
      url: Setlister.groupPath + '/setlists.json',
      type: 'get',
      dataType: 'json',
      contentType: 'application/json',
      success: function( data ) {
        $this.html( Mustache.render( flyoutTemplate, { setlists: data } ) );
      }
    });
  });

  var $form = $( 'form.edit_setlist' ),
    $builder = $( '.builder' );

  $builder.find( '.button.save-setlist' ).on( 'click', function( evt ) {
    evt.preventDefault();
    $form.submit();
  });

  $form.on( 'submit', function( evt ) {
    $builder.find( '.order-field' ).each( function() {
      var $this = $( this );

      $this.closest( 'tr' ).data( 'pos', $this.val() );
    });

    $builder.find( 'tr:not(.header)' ).each( function( idx ) {
      var $this = $( this ),
        oldPos = $this.data( 'old-pos' ),
        newPos = $this.data( 'pos' ),
        key = $this.find( '.key-selector' ).data( 'key' ),
        capo = $this.find( '.capo-selector' ).val(),
        $pos = $( '#setlist_setlist_songs_attributes_' + idx + '_position' ),
        $capo = $pos.siblings( '[name$="[capo]"]' ),
        $key = $pos.siblings( '[name$="[data_key]"]' );

      $pos.val( newPos );
      $key.val( key );
      $capo.val( capo );
    });
  });

  $builder.find( '.edit-print' ).on( 'input', function() {
    $.ajax({
      url: Setlister.groupPath + '/setlists/' + $( '#setlist-id' ).text() + '.json',
      type: 'PUT',
      data: $( this ).serialize(),
      success: function() {
        console.log('print values saved!');
      }
    });
  });

  $( '[data-info]' ).each( function() {
    var display = new WebPro.Widget.Display( '.song-info.flyout', {
      trigger: $( this ),
      displayClass: 'show',
      hideClass: 'hide',
      activeClass: 'active',
      displayEvent: 'click',
      positionAround: {
        position: 'left',
        positionOffset: 10,
        align: 'top',
        alignOffset: -20
      }
    });
  });

  $( '.song-info.flyout' ).on( 'wp-display-show', function( evt, trigger ) {
    var $this = $( this ),
      $trigger = $( trigger ),
      flyoutContentID = $trigger.data( 'info' ),
      $flyoutContent = $this.find( '#' + flyoutContentID + '-info' );

    $this.find( '.song-info-content' ).hide();
    $flyoutContent.show();
  });

  var numbers = { 'Ab': 11, 'A': 0, 'A#': 1, 'Bb': 1, 'B': 2, 'C': 3, 'C#': 4, 'Db': 4, 'D': 5, 'D#': 6, 'Eb': 6, 'E': 7, 'F': 8, 'F#': 9, 'Gb': 9, 'G': 10, 'G#': 11 },
    notes = {
      sharps: [ 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#' ],
      flats: [ 'A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab' ]
    };

  $( '.print-setlist' ).on( 'click', function( evt ) {
    evt.preventDefault();
    window.print();
  });

  $( '.print-setlist-without-capo' ).on( 'click', function( evt ) {
    evt.preventDefault();

    var backup = {};
    $builder.find( 'tr:not(.header)' ).each( function() {
      var $this = $( this ),
        position = $this.data( 'pos' ),
        $key = $this.find( '.key-selector a.active ' ),
        key = $key.text(),
        $keys = $this.find( '.key-selector a' ),
        currentIndex = numbers[ key ],
        capo = parseInt( $this.find( '.capo-selector' ).val() ),
        newIndex = ( currentIndex + capo ) % 12,
        newKey = notes.sharps[ newIndex ];

      $keys.each(function() {
        if ( $(this).text() == newKey ) {
          $(this).click();
          return false;
        }
      });

      $( '.capo' ).hide();

      backup[ position ] =  { key: key, capo: capo };
    });

    window.print();

    $builder.find( 'tr:not(.header)' ).each( function() {
      var $this = $( this ),
        song = backup[ $this.data( 'pos' ) ],
        key = song.key,
        $keys = $this.find( '.key-selector a' );

      $keys.each(function() {
        if ( $(this).text() == key ) {
          $(this).click();
          return false;
        }
      });

      $( '.capo' ).show();
    });
  });

  $( '.song-shortcut' ).click( function( evt ) {
    evt.preventDefault();
    var id = $( this ).attr( 'href' );

    console.log(id);
    window.scroll( 0, $( id ).offset().top - 160 );
  });
});
