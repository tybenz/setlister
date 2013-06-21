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
      url: '/setlists.json',
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
});
