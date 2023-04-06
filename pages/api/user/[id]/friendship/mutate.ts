// tmrw มึงเจอกุ
/*
route1: manipulating the friendship
POST /user/:id/friendship/mutate

adding friends state machine

1 (NEUTRAL) : add 00
if cant find both where {from == userID && to == :id
 && from == :id && to == userId}

2 (OUTGOING) :  01
if there exist where {from == userID && to == :id}

3 (INCOMING) : accept 10
if there exist where {from == userID && to == :id}

4 (FRIENDLY) : remove 11
if there exist both {from == userID && to == :id}

methods
add
accept
remove
*/