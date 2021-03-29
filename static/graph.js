d3.json("../cache.json", function (d) {
  return d;
})
.then(function (data) {
  var graph = data.Graph;

  // Set in_degree to 0
  Object.values(graph.vertices).forEach((n) => {
    n.inDegree = 0;
  });

  // Compute number of incoming links
  var links = [];
  Object.entries(graph.adjacencyMap).forEach(([k,e]) => {
    Object.keys(e).forEach((n) => {
      graph.vertices[n].inDegree += 1;
      var link = {};
      link.source = k;
      link.target = n;
      links.push(link);
    })
  });

  // Create a scale for radius
  var radius_scale = d3
    .scaleSqrt()
    .domain([
      d3.min(Object.values(graph.vertices), (n) => n.inDegree),
      d3.max(Object.values(graph.vertices), (n) => n.inDegree),
    ])
    .range([3, 20]);

  // Create color scale
  var unpinned_color_scale = d3
    .scaleLinear()
    .domain([
      d3.min(Object.values(graph.vertices), (n) => n.inDegree),
      d3.max(Object.values(graph.vertices), (n) => n.inDegree),
    ])
    .range(["#ffffff", "#19a6a6"]);

  // Create color scale
  var pinned_color_scale = d3
    .scaleLinear()
    .domain([
      d3.min(Object.values(graph.vertices), (n) => n.inDegree),
      d3.max(Object.values(graph.vertices), (n) => n.inDegree),
    ])
    .range(["#ffffff", "#cc3d3d"]);


  var pandocDiv = document.getElementsByClassName("pandoc")[0];

  var width = pandocDiv.clientWidth;
  var height = 800;

  var force = d3
    .forceSimulation()
    .nodes(Object.values(graph.vertices))
    .force("link", d3.forceLink(links).distance(100).id((d) => d.ID))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .force("charge", d3.forceManyBody().strength(-250).distanceMin(50))
    .alphaTarget(1)
    .on("tick", tick);


  var svg = d3
    .select(".pandoc")
    .insert("svg", ":nth-child(3)")
    .attr("width", width)
    .attr("height", height);

  svg
    .append('defs')
    .append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', [0, 0, 10, 10])
    .attr('refX', 1)
    .attr('refY', 5)
    .attr('markerWidth', 10)
    .attr('markerHeight', 15)
    .attr('orient', 'auto-start-reverse')
    .append('path')
    .attr('d', d3.line()([[0,0], [10,5], [0,10]]))
    .attr('stroke', 'black');

  // add the links
  var path = svg
    .append("g")
    .selectAll("path")
    .data(links)
    .enter()
    .append("path")
    .attr("class", (d) => "link")
    .attr("marker-end", "url(#arrow)");

  // define the nodes
  var node = svg
    .selectAll(".node")
    .data(force.nodes())
    .enter()
    .append("g")
    .attr("class", "node")
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
    .on("click", onClick)
    .on("dblclick", dblClick);

  // add the nodes
  node
    .append("circle")
    .attr("id", (d) => "circle-" + d.index)
    .attr("r", (d) => radius_scale(d.inDegree))
    .attr( "fill",
        (d) => unpinned_color_scale(d.inDegree)
    );

  // add node labels
  node
    .append("text")
    .attr("id", (d) => "label-" + d.ID)
    .attr("class", "node_labels")
    .attr("x", (d) => radius_scale(d.inDegree))
    .attr("y", (d) => -radius_scale(d.inDegree))
    .text((d) => d.Title);

  // add the curvy lines
  function tick() {
    path.attr("d", function (d) {
      var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
      return (
        "M" +
        d.source.x +
        "," +
        d.source.y +
        "A" +
        dr +
        "," +
        dr +
        " 0 0,1 " +
        d.target.x +
        "," +
        d.target.y
      );
    });

    node.attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  }

  function dragstarted(event, d) {
    if (!event.active) force.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
    d.fixed = true;
    node.select("#circle-" + d.index)
        .attr("fill", pinned_color_scale(d.inDegree))
  }

  function dragended(event, d) {
    if (!event.active) force.alphaTarget(0);
    if (d.fixed) {
      d.fx = d.x;
      d.fy = d.y;
    } else {
      d.fx = null;
      d.fy = null;
    }
  }

  function onClick(event, d) {
    if (d.fixed && event.ctrlKey) {
      d.fixed = false;
      node.select("#circle-" + d.index)
          .attr("fill", unpinned_color_scale(d.inDegree))
      d.fx = null;
      d.fy = null;
    }
  }

  function dblClick(event, d) {
    console.log(d);
    console.log(graph.adjacencyMap[d.ID]);
    window.open("../" + d.ID + ".html");
  }

})
.catch(function (error) {
  console.log(error);
});

