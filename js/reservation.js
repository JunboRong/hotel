function selectRoom(element) {

    document.querySelectorAll('.room').forEach(room => {
        room.classList.remove('selected');
    });

    element.classList.add('selected');
}
