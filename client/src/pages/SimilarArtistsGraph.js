import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function SimilarArtistsGraph({ data, onArtistClick }) {
  const svgRef = useRef(null);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();

    const nodes = data.nodes || [];
    const links = data.links || [];
    if (!nodes.length || !links.length) return;

    const width = svgElement.clientWidth || 800;
    const height = svgElement.clientHeight || 500;

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const sharedExtent = d3.extent(links, d => d.weight);
    const minShared = sharedExtent[0] || 1;
    const maxShared = sharedExtent[1] || minShared;

    const weightedColor = d3
      .scaleLinear()
      .domain([minShared, maxShared])
      .range(['#bbbbbb', '#ff4500']);

    const centerX = width / 2;
    const centerY = height / 2;
    const targetRadius = Math.min(width, height) / 9;

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id(d => d.id)
          .distance(40)
          .strength(1)
      )
      .force('charge', d3.forceManyBody().strength(-35))
      .force('center', d3.forceCenter(centerX, centerY))
      .force(
        'radial',
        d3
          .forceRadial(targetRadius, centerX, centerY)
          .strength(0.05)
      )
      .force('collision', d3.forceCollide(9))
      .force('boundary', () => {
        nodes.forEach(d => {
          d.x = Math.max(10, Math.min(width - 10, d.x));
          d.y = Math.max(10, Math.min(height - 10, d.y));
        });
      })
      .alphaDecay(0.03);

    const link = svg
      .append('g')
      .attr('stroke-opacity', 0.4)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => weightedColor(d.weight))
      .attr('stroke-width', 1);

    const node = svg
      .append('g')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 3)
      .attr('fill', '#222222')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on('click', (event, d) => {
        if (onArtistClick) {
          onArtistClick(d);
        } else {
          console.log('Clicked artist:', d);
        }
      });

    const label = svg
      .append('g')
      .style('font-family', 'Georgia, serif')
      .style('font-size', '10px')
      .style('user-select', 'none')
      .style('-webkit-user-select', 'none')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', -8)
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('cx', d => d.x).attr('cy', d => d.y);

      label.attr('x', d => d.x).attr('y', d => d.y);
    });

    return () => {
      simulation.stop();
    };
  }, [data, onArtistClick]);

  return (
    <svg
      ref={svgRef}
      style={{
        width: '100%',
        height: '500px',
        background: 'rgba(255,255,255,0.9)',
        borderRadius: '8px',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    />
  );
}
