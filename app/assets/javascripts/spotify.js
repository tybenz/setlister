var Spotify = {
  init: function() {
    Spotify.resultsTemplate = $( '#spotify-results-template' ).text();
    $( '[data-spotify-uri]' ).on( 'click', function( evt ) {
      evt.preventDefault();
      Spotify.play( this );
    });
    $( '.spotify-link-panel' ).click( function( evt ) {
      evt.preventDefault();
      $( this ).hide();
      $( '.spotify-search-panel' ).show();
    });
    $( '.spotify-search-panel .search-form' ).on( 'keypress', function( evt ) {
      if ( evt.keyCode == 13 ) {
        evt.preventDefault();
        Spotify.search();
      }
    }).find( '.button' ).on( 'vclick', function( evt ) {
      evt.preventDefault();
      Spotify.search();
    });
    $( '.spotify-search-panel .icon-remove' ).on( 'vclick', function( evt ) {
      evt.preventDefault();
      $( '.spotify-search-panel' ).hide();
      $( '.spotify-link-panel' ).show();
    });
    $( '.spotify-search-results' ).on( 'vclick', '.button[data-link-to-spotify]', function( evt ) {
      evt.preventDefault();
      var $this = $( this ),
        allClasses = 'linking linked';

      $( '.spotify-search-results .button[data-link-to-spotify]' ).removeClass( allClasses );
      $this.addClass( 'linking' );

      $( '#spotify-uri-field' ).val( $( this ).data( 'link-to-spotify' ) );
      $this.removeClass( 'linking' ).addClass( 'linked' );
    });
  },
  play: function( link ) {
    var uri = $( link ).data( 'spotify-uri' );
    $( '#spotify-player iframe' ).attr( 'src', Spotify.embedURL + '/?uri=' + uri );
    $( '#spotify-player' ).show();
  },
  embedURL: 'https://embed.spotify.com',
  search: function() {
    var query = $( '.spotify-search-panel #spotify-search-field' ).val().split(' ').join('+');
    $( '.spotify-search-panel .search-form' ).addClass( 'querying' );
    $.ajax({
      url: 'http://ws.spotify.com/search/1/track.json?q=' + query,
      crossDomain: true,
      success: Spotify.renderSearchResults
    });
  },
  renderSearchResults: function( response ) {
    response.tracks = response.tracks.splice(0, 9);
    for ( var i in response.tracks ) {
      response.tracks[i].artist = response.tracks[i].artists[0];
    }
    $( '.spotify-search-panel .search-form' ).removeClass( 'querying' );
    $( '.spotify-search-results' ).html( Mustache.render( Spotify.resultsTemplate, response ) );
  }
};
window.Spotify = Spotify;
