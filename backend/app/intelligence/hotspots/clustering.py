from typing import List
from app.models.report import Report
from app.intelligence.relationships.scoring import calculate_haversine_distance
from app.core.config import settings


def cluster_reports_density(
    reports: List[Report],
    epsilon_meters: float = settings.HOTSPOT_EPSILON_METERS,
    min_reports: int = settings.HOTSPOT_MIN_REPORTS
) -> List[List[Report]]:
    """Performs density-based spatial clustering (DBSCAN equivalent) on reports.

    Groups reports geographically where points are within epsilon_meters distance.
    Filters out any clusters smaller than min_reports.
    """
    if len(reports) < min_reports:
        return []

    visited = set()
    clusters: List[List[Report]] = []

    # Build neighbor map
    n = len(reports)
    neighbors_map = {i: [] for i in range(n)}

    for i in range(n):
        for j in range(i + 1, n):
            dist = calculate_haversine_distance(
                reports[i].latitude, reports[i].longitude,
                reports[j].latitude, reports[j].longitude
            )
            if dist <= epsilon_meters:
                neighbors_map[i].append(j)
                neighbors_map[j].append(i)

    for i in range(n):
        if i in visited:
            continue

        # Check core point condition
        neighbors = neighbors_map[i]
        if len(neighbors) + 1 < min_reports:
            continue

        # Expand cluster
        cluster_indices = set([i])
        visited.add(i)

        queue = list(neighbors)
        while queue:
            curr = queue.pop(0)
            if curr not in visited:
                visited.add(curr)
                curr_neighbors = neighbors_map[curr]
                if len(curr_neighbors) + 1 >= min_reports:
                    queue.extend([k for k in curr_neighbors if k not in visited])
            cluster_indices.add(curr)

        cluster_reports = [reports[idx] for idx in cluster_indices]
        if len(cluster_reports) >= min_reports:
            clusters.append(cluster_reports)

    return clusters
