//
//
// Util
//
// Medium Rare utility functions

const mrUtil = (($) => {
  // Activate tooltips
  $('[data-toggle="tooltip"]').tooltip();

  const Util = {

    activateIframeSrc(iframe) {
      const $iframe = $(iframe);
      if ($iframe.attr('data-src')) {
        $iframe.attr('src', $iframe.attr('data-src'));
      }
    },

    idleIframeSrc(iframe) {
      const $iframe = $(iframe);
      $iframe.attr('data-src', $iframe.attr('src')).attr('src', '');
    },
  };

  return Util;
})(jQuery);

export default mrUtil;
