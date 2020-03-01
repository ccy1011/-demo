
// 建树函数
//可参考  https://www.cnblogs.com/wanyong-wy/p/7603123.html
function jsonToD3(data) {

    var container = document.getElementById('d3Frame');
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    var margin = {
        top: 5,
        right: 120,
        bottom: 5,
        left: 120
    };
    var width = 960 - margin.right - margin.left;
    var height = 500 - margin.top - margin.bottom;
    var i = 0,
        duration = 500;
    var root = data;
    var tree = d3.layout.tree().size([height, width]);
    var diagonal = d3.svg.diagonal().projection(function(d) {
        return [d.y, d.x];
    });
	d3.select('#d3Frame').style("height", "500px");
    var svg = d3.select("#d3Frame").append("svg")
        .attr("width", '100%').attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    root.x0 = height / 2;
    root.y0 = 0;


// 折叠根节点的每个孩子
    root.children.forEach(collapse);
	// 折叠之后要重绘
    update(root);
	
	


	// 递归调用,有子孙的就把children（显示）给_children（不显示）暂存，便于折叠，
    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }
	
	//根据数据来渲染树
    function update(source) {
        // 计算新树的布局
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function(d) {
            d.y = d.depth * 180;
        });

        // Update the nodes…
        var node = svg.selectAll("g.node").data(nodes, function(d) {
            return d.id || (d.id = ++i);
        });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g").attr("class", "node").attr("transform", function(d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
        }).on("click", click);
        nodeEnter.append("circle").attr("r", 1e-6).style("fill", function(d) {
            return d._children ? "lightsteelblue" : "#fff";
        });
        nodeEnter.append("text").attr("x", function(d) {
			//控制文字显示位置的
            return d.children || d._children ? -10 : 10;
        }).attr("dy", ".35em").attr("text-anchor", function(d) {
            return d.children || d._children ? "end" : "start";
        }).text(function(d) {
            return d.name;
        }).style("fill-opacity", 1e-6);

        // Transition nodes to their new position.
        var nodeUpdate = node.transition().duration(duration).attr("transform", function(d) {
            return "translate(" + d.y + "," + d.x + ")";
        });
        nodeUpdate.select("circle").attr("r", 4.5).style("fill", function(d) {
            return d._children ? "lightsteelblue" : "#fff";
        });
        nodeUpdate.select("text").style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition().duration(duration).attr("transform", function(d) {
            return "translate(" + source.y + "," + source.x + ")";
        }).remove();
        nodeExit.select("circle").attr("r", 1e-6);
        nodeExit.select("text").style("fill-opacity", 1e-6);

        // Update the links…
        var link = svg.selectAll("path.link").data(links, function(d) {
            return d.target.id;
        });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g").attr("class", "link").attr("d", function(d) {
            var o = {
                x: source.x0,
                y: source.y0
            };
            return diagonal({
                source: o,
                target: o
            });
        });

        // Transition links to their new position.
        link.transition().duration(duration).attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition().duration(duration).attr("d", function(d) {
            var o = {
                x: source.x,
                y: source.y
            };
            return diagonal({
                source: o,
                target: o
            });
        }).remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    // 点击时切换折叠
    function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
		// 重新渲染
        update(d);
    }
}
