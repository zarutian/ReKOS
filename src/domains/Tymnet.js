import { src as zeForth } from "../zeForth_stripped.js";

const src = zeForth.concat(`
  # .org __domain_start

  # todo: setup the Call Transfer Block

  # TymnetBaseAdapterCreator(kt+5, SpaceBank, Meter, send_base_a_packet ; => rc, recieve_a_packet, TymnetBaseLicenseKey ; )
  # follows the Lemcom '83 protocol

  # todo:
  #  1. get three nodes from SpaceBank and construct a domain
  #  2. save SpaceBank and Meter to apropos domain keyslots
  #  3. save send_base_a_packet  to apropos domain keyslot
  
`);

export { src };
