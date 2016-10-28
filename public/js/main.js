var socket = io()


var granimInstance = new Granim({
    element: '#canvas-basic',
    name: 'basic-gradient',
    direction: 'left-right',
    opacity: [1, 1],
    isPausedWhenNotInView: true,
    states : {
        "default-state": {
            gradients: [
              ['#132531', '#615b55'],
              ['#615b55', '#132531']
            ]
        }
    }
});
