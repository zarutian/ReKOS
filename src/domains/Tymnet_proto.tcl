
package require Tcl 8.5

# taken from https://wiki.tcl-lang.org/page/Zarutian
proc thingy {name} {
  if {[lsearch -exact [info commands] $name] != -1} {
      error "a command/thingy with $name already exists!"
  }
  namespace eval ::things::[set name] {}
  proc ::things::[set name]::self {} "return [namespace current]::$name"
  proc ::things::[set name]::initialize {args} {}
  proc ::things::[set name]::destroy {args} {
    namespace delete [namespace current]
  }
  proc ::things::[set name]::dispatch {args} {
    return [uplevel 1 $args]
  }
  proc $name args "namespace eval ::things::[set name] dispatch \$args"
}

# see https://github.com/TYMCOM-X/169281.tape/blob/61a4c1fcd77c19952506cd141ca9bb9dd0adfd4c/fremontdoc/tbase.doc
# for Lemcom '83
proc make_tymnet_adapter {tna send_base_a_packet recieptionist} {
  thingy $tna
  $tna variable sbp [set send_base_a_packet]
  $tna variable recieptionist $recieptionist
  $tna proc recieve_a_packet_from_base {packet} {

  }
}
