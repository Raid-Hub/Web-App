"use client"

import styled from "styled-components"

export const StatBox = ({
    label,
    primaryValue,
    secondaryValue,
    aggLabel,
    rank
}: {
    label: string
    primaryValue: string
    secondaryValue?: string
    aggLabel: string
    rank?: number
}) => {
    return (
        <StyledStatBox>
            <h4>{label}</h4>
            <div>
                <div className="stat-box-value">
                    <span>{primaryValue}</span>
                </div>
                {rank != null && <div className="stat-box-rank">Rank #{rank}</div>}
                <div className="stat-box-agg-value">
                    {secondaryValue ? (
                        <>
                            <span>{aggLabel}</span>: <span>{secondaryValue}</span>
                        </>
                    ) : (
                        <span>{aggLabel}</span>
                    )}
                </div>
            </div>
        </StyledStatBox>
    )
}

const StyledStatBox = styled.div`
    background-color: rgba(32, 32, 32, 0.281);
    padding: 0.5rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.281);

    max-width: 12rem;

    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 0.5rem;

    h4 {
        text-transform: uppercase;
        margin: 0;
        text-wrap: balance;
    }

    .stat-box-value {
        font-size: 1.25rem;
        color: ${({ theme }) => theme.colors.text.primary};
    }

    .stat-box-rank {
        font-size: 0.9em;
        color: ${({ theme }) => theme.colors.text.primary};
    }

    .stat-box-agg-value {
        font-size: 0.8em;
        font-style: italic;
        color: ${({ theme }) => theme.colors.text.secondary};
    }
`
