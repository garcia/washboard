function switch_form() {
    if ($('#changename').css('display') == 'none') {
        $('#changename').fadeIn()
        $('#setpassword').fadeOut()
    }
    else {
        $('#changename').fadeOut()
        $('#setpassword').fadeIn()
    }
}
