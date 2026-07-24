package com.viego.identity;

import com.viego.identity.application.HandleGenerator;
import com.viego.identity.infrastructure.persistence.ExplorerRepository;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class HandleGeneratorTest {

    private final ExplorerRepository explorers = mock(ExplorerRepository.class);
    private final HandleGenerator generator = new HandleGenerator(explorers);

    @Test
    void sanitizesAndLowercasesTheSeed() {
        when(explorers.existsByHandle("minhdinh")).thenReturn(false);

        assertThat(generator.generate("Minh Dinh")).isEqualTo("minhdinh");
    }

    @Test
    void stripsCharactersOutsideTheAllowedSet() {
        when(explorers.existsByHandle("minhdq")).thenReturn(false);

        assertThat(generator.generate("Minh! @DQ#")).isEqualTo("minhdq");
    }

    @Test
    void retriesWithANumericSuffixOnCollision() {
        when(explorers.existsByHandle("minhdinh")).thenReturn(true);
        when(explorers.existsByHandle("minhdinh2")).thenReturn(true);
        when(explorers.existsByHandle("minhdinh3")).thenReturn(false);

        assertThat(generator.generate("minhdinh")).isEqualTo("minhdinh3");
    }

    @Test
    void fallsBackWhenTheSeedSanitizesToNothing() {
        when(explorers.existsByHandle(eq("explorer"))).thenReturn(false);

        assertThat(generator.generate("!!!")).isEqualTo("explorer");
    }

    @Test
    void truncatesToTheColumnLimitLeavingRoomForASuffix() {
        String longSeed = "a".repeat(40);
        when(explorers.existsByHandle("a".repeat(32))).thenReturn(true);
        when(explorers.existsByHandle("a".repeat(31) + "2")).thenReturn(false);

        String handle = generator.generate(longSeed);

        assertThat(handle).hasSize(32);
        assertThat(handle).isEqualTo("a".repeat(31) + "2");
    }
}
